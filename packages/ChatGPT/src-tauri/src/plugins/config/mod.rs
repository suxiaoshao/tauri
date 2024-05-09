/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-09 20:18:56
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/config/mod.rs
 */
use tauri::{Manager, Runtime, WindowBuilder};

use crate::errors::ChatGPTResult;
mod config_data;
mod listen;
pub use config_data::ChatGPTConfig;
pub use listen::Listenable;

pub struct ConfigPlugin<T, P> {
    left: T,
    right: P,
}
impl<R, T, P> tauri::plugin::Plugin<R> for ConfigPlugin<T, P>
where
    R: Runtime,
    ConfigPlugin<T, P>: Listenable,
    T: Send,
    P: Send,
{
    fn name(&self) -> &'static str {
        "config"
    }
    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _config: serde_json::Value,
    ) -> tauri::plugin::Result<()> {
        initialize(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: tauri::Invoke<R>) {
        let set_config =
            |app_handle: tauri::AppHandle<R>, data: ChatGPTConfig| -> ChatGPTResult<()> {
                let old_config = ChatGPTConfig::get(&app_handle)?;
                data.save(&app_handle)?;
                self.listen(&old_config, &data, &app_handle)?;
                Ok(())
            };
        let cmd = invoke.message.command();
        match cmd {
            "set_config" => {
                #[allow(unused_imports)]
                use tauri::command::private::*;
                #[allow(unused_variables)]
                let tauri::Invoke {
                    message: tauri_message,
                    resolver: tauri_resolver,
                } = invoke;
                let result = set_config(
                    match tauri::command::CommandArg::from_command(tauri::command::CommandItem {
                        name: "set_config",
                        key: "appHandle",
                        message: &tauri_message,
                    }) {
                        Ok(arg) => arg,
                        Err(err) => return tauri_resolver.invoke_error(err),
                    },
                    match tauri::command::CommandArg::from_command(tauri::command::CommandItem {
                        name: "set_config",
                        key: "data",
                        message: &tauri_message,
                    }) {
                        Ok(arg) => arg,
                        Err(err) => return tauri_resolver.invoke_error(err),
                    },
                );
                let kind = result.blocking_kind();
                kind.block(result, tauri_resolver);
            }
            "get_config" => {
                #[allow(unused_imports)]
                use tauri::command::private::*;
                #[allow(unused_variables)]
                let tauri::Invoke {
                    message: tauri_message,
                    resolver: tauri_resolver,
                } = invoke;
                let result = get_config(
                    match tauri::command::CommandArg::from_command(tauri::command::CommandItem {
                        name: "get_config",
                        key: "appHandle",
                        message: &tauri_message,
                    }) {
                        Ok(arg) => arg,
                        Err(err) => return tauri_resolver.invoke_error(err),
                    },
                );
                let kind = result.blocking_kind();
                kind.block(result, tauri_resolver);
            }
            "create_setting_window" => {
                #[allow(unused_imports)]
                use tauri::command::private::*;
                #[allow(unused_variables)]
                let tauri::Invoke {
                    message: tauri_message,
                    resolver: tauri_resolver,
                } = invoke;
                tauri_resolver.respond_async_serialized(async move {
                    let result = create_setting_window(
                        tauri::command::CommandArg::from_command(tauri::command::CommandItem {
                            name: "create_setting_window",
                            key: "app",
                            message: &tauri_message,
                        })?,
                        tauri::command::CommandArg::from_command(tauri::command::CommandItem {
                            name: "create_setting_window",
                            key: "window",
                            message: &tauri_message,
                        })?,
                    );
                    let kind = result.async_kind();
                    kind.future(result).await
                });
            }
            _ => invoke.resolver.reject({
                let res = format!("command {} not found", cmd,);
                res
            }),
        }
    }
}
fn initialize<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    //data path
    ChatGPTConfig::get(app)?;
    // let path = ChatGPTConfig::path(app)?;
    // let app2 = app.clone();
    // let mut watcher = notify::recommended_watcher(move |res| match res {
    //     Ok(_) => {
    //         println!("config file changed");
    //         match ChatGPTConfig::get(&app2) {
    //             Ok(config) => {
    //                 println!("config changed:{:?}", config);
    //                 if let Err(err) = app2.emit_to("main", "config", config) {
    //                     log::error!("emit config error:{err}");
    //                 };
    //             }
    //             Err(err) => {
    //                 log::error!("config file error:{err}");
    //             }
    //         };
    //     }
    //     Err(err) => {
    //         log::error!("watch file error:{err}");
    //     }
    // })?;
    // watcher.watch(&path, RecursiveMode::Recursive)?;
    // println!("watch config file:{:?}", path);
    Ok(())
}

#[tauri::command]
fn get_config<R: Runtime>(app_handle: tauri::AppHandle<R>) -> ChatGPTResult<ChatGPTConfig> {
    let state = ChatGPTConfig::get(&app_handle)?;
    Ok(state)
}

#[tauri::command]
async fn create_setting_window<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
) -> ChatGPTResult<()> {
    match app.get_window("setting") {
        Some(window) => {
            window.show()?;
            window.set_focus()?;
        }
        None => {
            let child =
                WindowBuilder::new(&app, "setting", tauri::WindowUrl::App("/setting".into()))
                    .title("setting")
                    .transparent(true)
                    .decorations(false);

            #[cfg(target_os = "macos")]
            let child = child.parent_window(window.ns_window().unwrap());
            #[cfg(windows)]
            let child = child.owner_window(window.hwnd().unwrap());
            child.build()?;
        }
    };
    Ok(())
}

pub struct MainConfigListener;

impl Listenable for MainConfigListener {
    fn listen<R: Runtime>(
        &self,
        old_value: &ChatGPTConfig,
        new_value: &ChatGPTConfig,
        app_handle: &tauri::AppHandle<R>,
    ) -> ChatGPTResult<()> {
        if old_value != new_value {
            app_handle.emit_to("main", "config", new_value)?;
        }
        Ok(())
    }
}

/* * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-09 20:18:56
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/config/mod.rs
 */
use std::time::Duration;
use tauri::{Emitter, Manager, Runtime, WebviewWindowBuilder};
use tokio::time::interval;

use crate::errors::ChatGPTResult;
use notify::{Config, EventHandler, RecommendedWatcher, RecursiveMode, Watcher};
mod config_data;
mod listen;
pub use config_data::ChatGPTConfig;
pub use listen::Listenable;

#[derive(Clone, Copy)]
pub struct ConfigPlugin<T, P> {
    left: T,
    right: P,
}
impl<R, T, P> tauri::plugin::Plugin<R> for ConfigPlugin<T, P>
where
    R: Runtime,
    ConfigPlugin<T, P>: Listenable,
    T: Send + Copy + 'static + Sync,
    P: Send + Copy + 'static + Sync,
{
    fn name(&self) -> &'static str {
        "config"
    }
    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _config: serde_json::Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self._initialize(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: tauri::ipc::Invoke<R>) -> bool {
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
                use tauri::ipc::private::*;
                #[allow(unused_variables)]
                let tauri::ipc::Invoke {
                    message: tauri_message,
                    resolver: tauri_resolver,
                    acl: tauri_acl,
                } = invoke;
                let result = set_config(
                    match tauri::ipc::CommandArg::from_command(tauri::ipc::CommandItem {
                        name: "set_config",
                        key: "appHandle",
                        message: &tauri_message,
                        plugin: None,
                        acl: &tauri_acl,
                    }) {
                        Ok(arg) => arg,
                        Err(err) => {
                            tauri_resolver.invoke_error(err);
                            return true;
                        }
                    },
                    match tauri::ipc::CommandArg::from_command(tauri::ipc::CommandItem {
                        name: "set_config",
                        key: "data",
                        message: &tauri_message,
                        plugin: None,
                        acl: &tauri_acl,
                    }) {
                        Ok(arg) => arg,
                        Err(err) => {
                            tauri_resolver.invoke_error(err);
                            return true;
                        }
                    },
                );
                let kind = result.blocking_kind();
                kind.block(result, tauri_resolver);
            }
            "get_config" => {
                #[allow(unused_imports)]
                use tauri::ipc::private::*;
                #[allow(unused_variables)]
                let tauri::ipc::Invoke {
                    message: tauri_message,
                    resolver: tauri_resolver,
                    acl: tauri_acl,
                } = invoke;
                let result = get_config(
                    match tauri::ipc::CommandArg::from_command(tauri::ipc::CommandItem {
                        name: "get_config",
                        key: "appHandle",
                        message: &tauri_message,
                        plugin: None,
                        acl: &tauri_acl,
                    }) {
                        Ok(arg) => arg,
                        Err(err) => {
                            tauri_resolver.invoke_error(err);
                            return true;
                        }
                    },
                );
                let kind = result.blocking_kind();
                kind.block(result, tauri_resolver);
            }
            "create_setting_window" => {
                #[allow(unused_imports)]
                use tauri::ipc::private::*;
                #[allow(unused_variables)]
                let tauri::ipc::Invoke {
                    message: tauri_message,
                    resolver: tauri_resolver,
                    acl: tauri_acl,
                } = invoke;
                tauri_resolver.respond_async_serialized(async move {
                    let result = create_setting_window(
                        tauri::ipc::CommandArg::from_command(tauri::ipc::CommandItem {
                            name: "create_setting_window",
                            key: "app",
                            message: &tauri_message,
                            plugin: None,
                            acl: &tauri_acl,
                        })?,
                        tauri::ipc::CommandArg::from_command(tauri::ipc::CommandItem {
                            name: "create_setting_window",
                            key: "window",
                            message: &tauri_message,
                            plugin: None,
                            acl: &tauri_acl,
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
        };
        true
    }
}
impl<T, P> ConfigPlugin<T, P>
where
    ConfigPlugin<T, P>: Listenable,
    T: Send + Copy + Sync + 'static,
    P: Send + Copy + Sync + 'static,
{
    fn _initialize<R: Runtime>(&self, app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
        //data path
        let data = ChatGPTConfig::get(app)?;
        let path = ChatGPTConfig::path(app)?;
        let app2 = app.clone();
        let this = *self;

        #[derive(Clone)]
        struct WatcherData<R, T, P>
        where
            R: Runtime,
            ConfigPlugin<T, P>: Listenable,
            T: Send + Copy + Sync + 'static,
            P: Send + Copy + Sync + 'static,
        {
            app: tauri::AppHandle<R>,
            this: ConfigPlugin<T, P>,
            old_config: ChatGPTConfig,
        }

        impl<R, T, P> EventHandler for WatcherData<R, T, P>
        where
            R: Runtime,
            ConfigPlugin<T, P>: Listenable,
            T: Send + Copy + std::marker::Sync + 'static,
            P: Send + Copy + std::marker::Sync + 'static,
        {
            fn handle_event(&mut self, event: notify::Result<notify::Event>) {
                match event {
                    Ok(_) => {
                        match ChatGPTConfig::get(&self.app) {
                            Ok(config) => {
                                let old_config = &self.old_config;
                                if let Err(err) = self.this.listen(old_config, &config, &self.app) {
                                    log::error!("config file listen error:{err}");
                                };
                                self.old_config = config;
                            }
                            Err(err) => {
                                log::error!("config file error:{err}");
                            }
                        };
                    }
                    Err(err) => {
                        log::error!("watch file error:{err}");
                    }
                }
            }
        }
        let watcher_data = WatcherData {
            app: app2,
            this,
            old_config: data,
        };

        tauri::async_runtime::spawn(async move {
            let mut interval = interval(Duration::from_secs(2));

            let mut watcher: RecommendedWatcher = match Watcher::new(
                watcher_data,
                Config::default().with_poll_interval(Duration::from_millis(100)),
            ) {
                Ok(watch) => watch,
                Err(err) => {
                    log::error!("watcher error:{err}");
                    return;
                }
            };
            match watcher.watch(&path, RecursiveMode::NonRecursive) {
                Ok(_) => {}
                Err(err) => {
                    log::error!("watcher error:{err}");
                    return;
                }
            };
            loop {
                interval.tick().await;
            }
        });

        app.manage(*self);

        Ok(())
    }
}

#[tauri::command]
pub fn get_config<R: Runtime>(app_handle: tauri::AppHandle<R>) -> ChatGPTResult<ChatGPTConfig> {
    let state = ChatGPTConfig::get(&app_handle)?;
    Ok(state)
}

#[tauri::command]
pub async fn create_setting_window<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::WebviewWindow<R>,
) -> ChatGPTResult<()> {
    match app.get_webview_window("setting") {
        Some(window) => {
            window.show()?;
            window.set_focus()?;
        }
        None => {
            let child = WebviewWindowBuilder::new(
                &app,
                "setting",
                tauri::WebviewUrl::App("/setting".into()),
            )
            .title("setting")
            .transparent(true)
            .decorations(false);
            let child = child.parent(&window)?;
            child.build()?;
        }
    };
    Ok(())
}

#[derive(Clone, Copy)]
pub struct MainConfigListener;

impl Listenable for MainConfigListener {
    fn listen<R: Runtime>(
        &self,
        old_value: &ChatGPTConfig,
        new_value: &ChatGPTConfig,
        app_handle: &tauri::AppHandle<R>,
    ) -> ChatGPTResult<()> {
        if old_value != new_value {
            app_handle.emit("config", new_value)?;
        }
        Ok(())
    }
}

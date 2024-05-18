/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-09 16:25:17
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-12 00:32:18
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/config/listen.rs
 */
use tauri::Runtime;

use crate::errors::ChatGPTResult;

use super::{ChatGPTConfig, ConfigPlugin};

pub trait Listenable {
    fn listen<R: Runtime>(
        &self,
        old_value: &ChatGPTConfig,
        new_value: &ChatGPTConfig,
        app_handle: &tauri::AppHandle<R>,
    ) -> ChatGPTResult<()>;
}

impl ConfigPlugin<(), ()> {
    pub fn new() -> Self {
        Self {
            left: (),
            right: (),
        }
    }
    pub fn add_listen<T: Listenable>(self, left: T) -> ConfigPlugin<T, ()> {
        ConfigPlugin { left, right: () }
    }
}

impl Listenable for ConfigPlugin<(), ()> {
    fn listen<R: Runtime>(
        &self,
        _old_value: &ChatGPTConfig,
        _new_value: &ChatGPTConfig,
        _app_handle: &tauri::AppHandle<R>,
    ) -> ChatGPTResult<()> {
        Ok(())
    }
}

impl<T> ConfigPlugin<T, ()>
where
    T: Listenable,
{
    pub fn add_listen<P: Listenable>(self, right: P) -> ConfigPlugin<T, P> {
        ConfigPlugin {
            left: self.left,
            right,
        }
    }
}

impl<T> Listenable for ConfigPlugin<T, ()>
where
    T: Listenable,
{
    fn listen<R: Runtime>(
        &self,
        old_value: &ChatGPTConfig,
        new_value: &ChatGPTConfig,
        app_handle: &tauri::AppHandle<R>,
    ) -> ChatGPTResult<()> {
        self.left.listen(old_value, new_value, app_handle)
    }
}

impl<T, P> Listenable for ConfigPlugin<T, P>
where
    T: Listenable,
    P: Listenable,
{
    fn listen<R: Runtime>(
        &self,
        old_value: &ChatGPTConfig,
        new_value: &ChatGPTConfig,
        app_handle: &tauri::AppHandle<R>,
    ) -> ChatGPTResult<()> {
        self.left.listen(old_value, new_value, app_handle)?;
        self.right.listen(old_value, new_value, app_handle)
    }
}

impl<T, P> ConfigPlugin<T, P>
where
    T: Listenable,
    P: Listenable,
{
    #[allow(dead_code)]
    fn add_listen<X: Listenable>(self, right: X) -> ConfigPlugin<T, ConfigPlugin<P, X>> {
        ConfigPlugin {
            left: self.left,
            right: ConfigPlugin {
                left: self.right,
                right,
            },
        }
    }
}

use std::future::Future;
use tokio::sync::oneshot;
use tokio::time::{sleep, Duration};

#[derive(Default)]
pub struct DelayedTask {
    cancel_handle: Option<oneshot::Sender<()>>,
}

impl DelayedTask {
    pub fn cancel(&mut self) {
        if let Some(cancel_handle) = self.cancel_handle.take() {
            let _ = cancel_handle.send(());
        }
    }

    pub fn update<F>(&mut self, delay: Duration, task: F)
    where
        F: Future + Send + 'static,
    {
        self.cancel();
        let (tx, rx) = oneshot::channel();
        self.cancel_handle = Some(tx);

        tauri::async_runtime::spawn(async move {
            tokio::select! {
                _ = sleep(delay) => {
                    task.await;
                }
                _ = rx => {
                    // Task was cancelled
                }
            }
        });
    }
}

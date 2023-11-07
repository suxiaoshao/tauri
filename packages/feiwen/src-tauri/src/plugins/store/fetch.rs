use crate::{
    errors::FeiwenResult,
    fetch::FetchRunner,
    store::{service::Novel, DbConn},
};

#[tauri::command(async)]
pub async fn fetch(
    state: tauri::State<'_, DbConn>,
    url: String,
    start_page: u32,
    end_page: u32,
    cookies: String,
) -> FeiwenResult<()> {
    match _fetch(state, url, start_page, end_page, cookies).await {
        Ok(_) => {
            log::info!("fetch success");
            Ok(())
        }
        Err(err) => {
            log::error!("fetch error: {:?}", err);
            Err(err)
        }
    }
}

pub struct Fetch {
    url: String,
    cookies: String,
    start: u32,
    end: u32,
    db_conn: DbConn,
}

impl FetchRunner for Fetch {
    fn get_url(&self) -> &str {
        self.url.as_str()
    }

    fn get_cookies(&self) -> &str {
        self.cookies.as_str()
    }

    fn get_start(&self) -> u32 {
        self.start
    }

    fn get_end(&self) -> u32 {
        self.end
    }

    fn resolve_novel(&self, novels: Vec<crate::store::service::Novel>) -> FeiwenResult<i64> {
        let conn = &mut self.db_conn.get()?;
        for novel in novels {
            novel.save(conn)?;
        }
        Novel::count(conn)
    }
}
async fn _fetch(
    state: tauri::State<'_, DbConn>,
    url: String,
    start_page: u32,
    end_page: u32,
    cookies: String,
) -> FeiwenResult<()> {
    // get conn
    let conn = state.inner().clone();
    let fetch = Fetch {
        cookies,
        url,
        db_conn: conn,
        end: end_page,
        start: start_page,
    };
    fetch.fetch().await?;
    Ok(())
}

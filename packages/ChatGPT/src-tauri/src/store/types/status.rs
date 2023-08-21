use std::str::FromStr;

use crate::errors::ChatGPTError;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone)]
pub enum Status {
    #[serde(rename = "normal")]
    Normal,
    #[serde(rename = "hidden")]
    Hidden,
    #[serde(rename = "loading")]
    Loading,
    #[serde(rename = "error")]
    Error,
}

impl FromStr for Status {
    type Err = ChatGPTError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "normal" => Ok(Status::Normal),
            "hidden" => Ok(Status::Hidden),
            "loading" => Ok(Status::Loading),
            "error" => Ok(Status::Error),
            _ => Err(ChatGPTError::InvalidMessageStatus(s.to_owned())),
        }
    }
}

impl ToString for Status {
    fn to_string(&self) -> String {
        match self {
            Status::Normal => "normal".to_owned(),
            Status::Hidden => "hidden".to_owned(),
            Status::Loading => "loading".to_owned(),
            Status::Error => "error".to_owned(),
        }
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_mode() {
        use super::Status;
        assert_eq!("normal".parse::<Status>().unwrap(), Status::Normal);
        assert_eq!("hidden".parse::<Status>().unwrap(), Status::Hidden);
        assert_eq!("loading".parse::<Status>().unwrap(), Status::Loading);
        assert_eq!("error".parse::<Status>().unwrap(), Status::Error);
        assert!("invalid".parse::<Status>().is_err());
    }
}

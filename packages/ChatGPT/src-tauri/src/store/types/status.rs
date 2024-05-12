use std::{fmt::Display, str::FromStr};

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

impl Display for Status {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Status::Normal => f.write_str("normal"),
            Status::Hidden => f.write_str("hidden"),
            Status::Loading => f.write_str("loading"),
            Status::Error => f.write_str("error"),
        }
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_mode() -> anyhow::Result<()> {
        use super::Status;
        assert_eq!("normal".parse::<Status>()?, Status::Normal);
        assert_eq!("hidden".parse::<Status>()?, Status::Hidden);
        assert_eq!("loading".parse::<Status>()?, Status::Loading);
        assert_eq!("error".parse::<Status>()?, Status::Error);
        assert!("invalid".parse::<Status>().is_err());
        Ok(())
    }
}

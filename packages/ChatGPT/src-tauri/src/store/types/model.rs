use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::errors::ChatGPTError;

#[derive(Debug, Serialize, Deserialize, Clone, Default, PartialEq, Eq)]
pub enum Model {
    #[default]
    #[serde(rename = "gpt-3.5-turbo-0613")]
    Gpt35_0613,
    #[serde(rename = "gpt-3.5-turbo")]
    Gpt35,
    #[serde(rename = "gpt-3.5-turbo-0301")]
    Gpt35_0301,
    #[serde(rename = "gpt-3.5-turbo-16k")]
    Gpt35_16k,
    #[serde(rename = "gpt-3.5-turbo-16k-0613")]
    Gpt35_16k0613,
}

impl FromStr for Model {
    type Err = ChatGPTError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "gpt-3.5-turbo-0613" => Ok(Model::Gpt35_0613),
            "gpt-3.5-turbo" => Ok(Model::Gpt35),
            "gpt-3.5-turbo-0301" => Ok(Model::Gpt35_0301),
            "gpt-3.5-turbo-16k" => Ok(Model::Gpt35_16k),
            "gpt-3.5-turbo-16k-0613" => Ok(Model::Gpt35_16k0613),
            _ => Err(ChatGPTError::InvalidModel(s.to_owned())),
        }
    }
}

impl ToString for Model {
    fn to_string(&self) -> String {
        match self {
            Model::Gpt35_0613 => "gpt-3.5-turbo-0613".to_owned(),
            Model::Gpt35 => "gpt-3.5-turbo".to_owned(),
            Model::Gpt35_0301 => "gpt-3.5-turbo-0301".to_owned(),
            Model::Gpt35_16k => "gpt-3.5-turbo-16k".to_owned(),
            Model::Gpt35_16k0613 => "gpt-3.5-turbo-16k-0613".to_owned(),
        }
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_model() {
        use super::Model;
        assert_eq!(
            "gpt-3.5-turbo-0613".parse::<Model>().unwrap(),
            Model::Gpt35_0613
        );
        assert_eq!("gpt-3.5-turbo".parse::<Model>().unwrap(), Model::Gpt35);
        assert_eq!(
            "gpt-3.5-turbo-0301".parse::<Model>().unwrap(),
            Model::Gpt35_0301
        );
        assert_eq!(
            "gpt-3.5-turbo-16k".parse::<Model>().unwrap(),
            Model::Gpt35_16k
        );
        assert_eq!(
            "gpt-3.5-turbo-16k-0613".parse::<Model>().unwrap(),
            Model::Gpt35_16k0613
        );
        assert!("invalid".parse::<Model>().is_err());
    }
}

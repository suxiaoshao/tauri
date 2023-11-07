/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:58:02
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/types/model.rs
 */
use std::str::FromStr;

use serde::{Deserialize, Serialize};

use crate::errors::ChatGPTError;

#[derive(Debug, Serialize, Deserialize, Clone, Default, PartialEq, Eq)]
pub enum Model {
    #[default]
    #[serde(rename = "gpt-3.5-turbo")]
    Gpt35,
    #[serde(rename = "gpt-3.5-turbo-16k")]
    Gpt35_16k,
    #[serde(rename = "gpt-3.5-turbo-instruct")]
    Gpt35instruct,
    #[serde(rename = "gpt-4")]
    Gpt4,
    #[serde(rename = "gpt-4-1106-preview")]
    Gpt41106preview,
}

impl FromStr for Model {
    type Err = ChatGPTError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "gpt-3.5-turbo" => Ok(Model::Gpt35),
            "gpt-3.5-turbo-16k" => Ok(Model::Gpt35_16k),
            "gpt-3.5-turbo-instruct" => Ok(Model::Gpt35instruct),
            "gpt-4" => Ok(Model::Gpt4),
            "gpt-4-1106-preview" => Ok(Model::Gpt41106preview),
            _ => Err(ChatGPTError::InvalidModel(s.to_owned())),
        }
    }
}

impl ToString for Model {
    fn to_string(&self) -> String {
        match self {
            Model::Gpt35 => "gpt-3.5-turbo".to_owned(),
            Model::Gpt4 => "gpt-4".to_owned(),
            Model::Gpt35instruct => "gpt-3.5-turbo-instruct".to_owned(),
            Model::Gpt35_16k => "gpt-3.5-turbo-16k".to_owned(),
            Model::Gpt41106preview => "gpt-4-1106-preview".to_owned(),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_model_from_str() {
        assert_eq!("gpt-3.5-turbo".parse::<Model>().unwrap(), Model::Gpt35);
        assert_eq!(
            "gpt-3.5-turbo-16k".parse::<Model>().unwrap(),
            Model::Gpt35_16k
        );
        assert_eq!(
            "gpt-3.5-turbo-instruct".parse::<Model>().unwrap(),
            Model::Gpt35instruct
        );
        assert_eq!("gpt-4".parse::<Model>().unwrap(), Model::Gpt4);
        assert_eq!(
            "gpt-4-1106-preview".parse::<Model>().unwrap(),
            Model::Gpt41106preview
        );
        assert!("invalid".parse::<Model>().is_err());
    }

    #[test]
    fn test_model_to_string() {
        assert_eq!(Model::Gpt35.to_string(), "gpt-3.5-turbo");
        assert_eq!(Model::Gpt35_16k.to_string(), "gpt-3.5-turbo-16k");
        assert_eq!(Model::Gpt35instruct.to_string(), "gpt-3.5-turbo-instruct");
        assert_eq!(Model::Gpt4.to_string(), "gpt-4");
        assert_eq!(Model::Gpt41106preview.to_string(), "gpt-4-1106-preview");
    }
}

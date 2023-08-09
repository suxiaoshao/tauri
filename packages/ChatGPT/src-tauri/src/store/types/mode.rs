use std::str::FromStr;

use crate::errors::ChatGPTError;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone, Copy)]
pub enum Mode {
    #[serde(rename = "contextual")]
    Contextual,
    #[serde(rename = "single")]
    Single,
    #[serde(rename = "assistant-only")]
    AssistantOnly,
}

impl FromStr for Mode {
    type Err = ChatGPTError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "contextual" => Ok(Mode::Contextual),
            "single" => Ok(Mode::Single),
            "assistant-only" => Ok(Mode::AssistantOnly),
            _ => Err(ChatGPTError::InvalidMode(s.to_owned())),
        }
    }
}

impl ToString for Mode {
    fn to_string(&self) -> String {
        match self {
            Mode::Contextual => "contextual".to_owned(),
            Mode::Single => "single".to_owned(),
            Mode::AssistantOnly => "assistant-only".to_owned(),
        }
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_mode() {
        use super::Mode;
        assert_eq!("contextual".parse::<Mode>().unwrap(), Mode::Contextual);
        assert_eq!("single".parse::<Mode>().unwrap(), Mode::Single);
        assert_eq!(
            "assistant-only".parse::<Mode>().unwrap(),
            Mode::AssistantOnly
        );
        assert!("invalid".parse::<Mode>().is_err());
    }
}

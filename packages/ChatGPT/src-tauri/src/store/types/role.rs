use std::str::FromStr;

use crate::errors::ChatGPTError;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Default, Clone, Copy)]
pub enum Role {
    #[serde(rename = "system")]
    System,
    #[serde(rename = "user")]
    #[default]
    User,
    #[serde(rename = "assistant")]
    Assistant,
}

impl FromStr for Role {
    type Err = ChatGPTError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "system" => Ok(Role::System),
            "user" => Ok(Role::User),
            "assistant" => Ok(Role::Assistant),
            _ => Err(ChatGPTError::InvalidRole(s.to_owned())),
        }
    }
}

impl ToString for Role {
    fn to_string(&self) -> String {
        match self {
            Role::System => "system".to_owned(),
            Role::User => "user".to_owned(),
            Role::Assistant => "assistant".to_owned(),
        }
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_mode() {
        use super::Role;
        assert_eq!("system".parse::<Role>().unwrap(), Role::System);
        assert_eq!("user".parse::<Role>().unwrap(), Role::User);
        assert_eq!("assistant".parse::<Role>().unwrap(), Role::Assistant);
        assert!("invalid".parse::<Role>().is_err());
    }
}

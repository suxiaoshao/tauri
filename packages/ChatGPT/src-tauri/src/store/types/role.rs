use std::{fmt::Display, str::FromStr};

use crate::errors::ChatGPTError;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Default, Clone, Copy)]
pub enum Role {
    #[serde(rename = "developer")]
    Developer,
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
            "developer" => Ok(Role::Developer),
            "user" => Ok(Role::User),
            "assistant" => Ok(Role::Assistant),
            _ => Err(ChatGPTError::InvalidRole(s.to_owned())),
        }
    }
}

impl Display for Role {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Role::Developer => "developer",
            Role::User => "user",
            Role::Assistant => "assistant",
        };
        write!(f, "{s}")
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn test_mode() -> anyhow::Result<()> {
        use super::Role;
        assert_eq!("developer".parse::<Role>()?, Role::Developer);
        assert_eq!("user".parse::<Role>()?, Role::User);
        assert_eq!("assistant".parse::<Role>()?, Role::Assistant);
        assert!("invalid".parse::<Role>().is_err());
        Ok(())
    }
}

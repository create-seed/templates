use quasar_lang::prelude::*;

#[error_code]
pub enum MyError {
    Unauthorized,
    Underflow,
    Overflow,
}

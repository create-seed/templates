use {
    crate::{events::RefundEvent, state::Escrow},
    quasar_lang::prelude::*,
    quasar_spl::prelude::*,
};

#[derive(Accounts)]
pub struct Refund {
    #[account(mut)]
    pub maker: Signer,
    #[account(
        mut,
        has_one(maker),
        constraints(Escrow::seeds(maker.address()).verify_existing(escrow.address(), &crate::ID).is_ok()),
        close(dest = maker),
    )]
    pub escrow: Account<Escrow>,
    pub mint_a: Account<Mint>,
    #[account(init(idempotent), payer = maker, token(mint = mint_a, authority = maker, token_program = token_program))]
    pub maker_ta_a: Account<Token>,
    #[account(mut)]
    pub vault_ta_a: Account<Token>,
    pub rent: Sysvar<Rent>,
    pub token_program: Program<TokenProgram>,
    pub system_program: Program<SystemProgram>,
}

impl Refund {
    #[inline(always)]
    pub fn emit_event(&self) -> Result<(), ProgramError> {
        emit!(RefundEvent {
            escrow: *self.escrow.address(),
        });
        Ok(())
    }

    #[inline(always)]
    pub fn withdraw_tokens_and_close(&mut self) -> Result<(), ProgramError> {
        let bump = [self.escrow.bump];
        let seeds = [
            Seed::from(b"escrow" as &[u8]),
            Seed::from(self.maker.address().as_ref()),
            Seed::from(bump.as_ref()),
        ];

        self.token_program
            .transfer(
                &self.vault_ta_a,
                &self.maker_ta_a,
                &self.escrow,
                self.vault_ta_a.amount(),
            )
            .invoke_signed(&seeds)?;

        self.token_program
            .close_account(&self.vault_ta_a, &self.maker, &self.escrow)
            .invoke_signed(&seeds)?;
        Ok(())
    }
}

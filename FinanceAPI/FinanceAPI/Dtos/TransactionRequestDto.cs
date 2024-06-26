namespace FinanceAPI.Dtos {
    public record TransactionRequestDto(decimal Amount, string Category, string Description);
}

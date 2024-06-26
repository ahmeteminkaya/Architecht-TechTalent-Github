namespace FinanceAPI.Dtos {
    public record TransferRequestDto(
        string ReceiverAccountNumber,
        decimal Amount
    );
}

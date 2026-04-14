namespace MemuVie.Evento.DTOs.Responses;

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Data { get; set; }

    public ApiResponse()
    {
    }

    public ApiResponse(bool success, string message)
    {
        Success = success;
        Message = message;
    }

    public ApiResponse(bool success, string message, object? data)
    {
        Success = success;
        Message = message;
        Data = data;
    }
}

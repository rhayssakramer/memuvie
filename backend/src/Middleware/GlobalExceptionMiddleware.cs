namespace MemuVie.Evento.Middleware;

using System.Net;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Exceptions;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponse(false, "Erro interno do servidor");
        int statusCode = (int)HttpStatusCode.InternalServerError;

        switch (exception)
        {
            case BusinessException ex:
                statusCode = (int)HttpStatusCode.BadRequest;
                response = new ApiResponse(false, ex.Message);
                break;

            case ResourceNotFoundException ex:
                statusCode = (int)HttpStatusCode.NotFound;
                response = new ApiResponse(false, ex.Message);
                break;

            case UnauthorizedException ex:
                statusCode = (int)HttpStatusCode.Unauthorized;
                response = new ApiResponse(false, ex.Message);
                break;

            case ArgumentException ex:
                statusCode = (int)HttpStatusCode.BadRequest;
                response = new ApiResponse(false, ex.Message);
                break;

            default:
                // Não exponha detalhes do erro em produção
                response = new ApiResponse(false, "Erro ao processar a requisição");
                break;
        }

        context.Response.StatusCode = statusCode;
        return context.Response.WriteAsJsonAsync(response);
    }
}

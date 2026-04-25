namespace MemuVie.Evento;

using AutoMapper;
using MemuVie.Evento.DTOs.Requests;
using MemuVie.Evento.DTOs.Responses;
using MemuVie.Evento.Models;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Usuario
        CreateMap<Usuario, UsuarioResponse>().ReverseMap();
        CreateMap<UsuarioRequest, Usuario>().ReverseMap();

        // Evento
        CreateMap<Evento, EventoResponse>()
            .ForMember(dest => dest.Usuario, opt => opt.MapFrom(src => src.Usuario));
        CreateMap<EventoRequest, Evento>().ReverseMap();
        CreateMap<Evento, EventoSummaryResponse>();

        // GaleriaPost
        CreateMap<GaleriaPost, GaleriaPostResponse>()
            .ForMember(dest => dest.Usuario, opt => opt.MapFrom(src => src.Usuario))
            .ForMember(dest => dest.Evento, opt => opt.MapFrom(src => new EventoSummaryResponse
            {
                Id = src.Evento.Id,
                Titulo = src.Evento.Titulo,
                DataEvento = src.Evento.DataEvento,
                ResultadoRevelacao = src.Evento.ResultadoRevelacao,
                Status = src.Evento.Status
            }));
        CreateMap<GaleriaPostRequest, GaleriaPost>().ReverseMap();
    }
}

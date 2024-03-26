using Abp.Application.Services;
using Abp.Application.Services.Dto;
using MyCompanyName.AbpZeroTemplate.Documents.Dto;

namespace MyCompanyName.AbpZeroTemplate.Documents
{
    public interface IDocumentAppServive : IApplicationService
    {
        ListResultDto<DocumentListDto> GetDocuments(GetDocumentsInput input);
    }
}

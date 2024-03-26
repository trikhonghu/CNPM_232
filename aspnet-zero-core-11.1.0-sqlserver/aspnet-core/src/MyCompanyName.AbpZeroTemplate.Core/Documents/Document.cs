using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;

namespace MyCompanyName.AbpZeroTemplate.Documents
{
    [Table("PbDocuments")]
    public class Document : FullAuditedEntity
    {
        public const int MaxTitleLength = 32;
        public const int MaxCodeLength = 32;
        public const int MaxReleaseDateLength = 32;
        public const int MaxOrganizationLength = 255;
        public const int MaxEffectiveDateLength = 32;
        public const int MaxExpirationDateLength = 32;
        public const int MaxTypeLength = 32;
        

        [Required]
        [MaxLength(MaxTitleLength)]
        public virtual string Title { get; set; }

        [Required]
        [MaxLength(MaxCodeLength)]
        public virtual string Code { get; set; }

        [Required]
        [MaxLength(MaxReleaseDateLength)]
        public virtual DateTime ReleaseDate { get; set; }

        [Required]
        [MaxLength(MaxOrganizationLength)]
        public virtual string Organization { get; set;}

        [Required]
        [MaxLength(MaxEffectiveDateLength)]
        public virtual DateTime EffectiveDate { get; set; }

        [Required]
        [MaxLength(MaxExpirationDateLength)]
        public virtual DateTime ExpirationDate { get; set; }

        [Required]
        [MaxLength(MaxTypeLength)]
        public virtual string Type { get; set; }






    }
}

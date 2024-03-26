using System;
using System.Collections.Generic;
using System.Text;

namespace MyCompanyName.AbpZeroTemplate.Documents.Dto
{
    public class DocumentListDto
    {
        public string Title { get; set; }

        public string Code { get; set; }

        public DateTime ReleaseDate { get; set; }

        public string Organization { get; set; }

        public DateTime EffectiveDate { get; set; }

        public DateTime ExpirationDate { get; set; }

        public string Type { get; set; }
    }
}

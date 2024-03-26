
using MyCompanyName.AbpZeroTemplate.Documents;
using MyCompanyName.AbpZeroTemplate.EntityFrameworkCore;
using System;
using System.Linq;

namespace MyCompanyName.AbpZeroTemplate.Migrations.Seed.Host
{
    public class InitialDocumentsCreator
    {
        private readonly AbpZeroTemplateDbContext _context;

        public InitialDocumentsCreator(AbpZeroTemplateDbContext context)
        {
            _context = context;
        }

        public void Create()
        {
            var douglas = _context.Documents.FirstOrDefault(p => p.Organization == "ABC hospital");
            if (douglas == null)
            {
                _context.Documents.Add(
                    new Document
                    {
                        Title = "First document",
                        Code = "000000",
                        Organization = "ABC hospital",
                        ReleaseDate = DateTime.Now,
                        Type = "Legal document",
                    });
            }

            var asimov = _context.Documents.FirstOrDefault(p => p.Organization == "DEF hospital");
            if (asimov == null)
            {
                _context.Documents.Add(
                    new Document
                    {
                        Title = "Second document",
                        Code = "000001",
                        Organization = "DEF hospital",
                        ReleaseDate = DateTime.Now,
                        Type = "Legal document",
                    });
            }
        }
    }
}

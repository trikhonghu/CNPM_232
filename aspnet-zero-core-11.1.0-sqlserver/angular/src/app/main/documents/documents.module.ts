import {NgModule} from '@angular/core';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {DocumentsRoutingModule} from './documents-routing.module';
import {DocumentsComponent} from './documents.component';

@NgModule({
    declarations: [DocumentsComponent],
    imports: [AppSharedModule, DocumentsRoutingModule]
})
export class DocumentsModule {}

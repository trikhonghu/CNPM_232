import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { DocumentServiceProxy, DocumentListDto, ListResultDtoOfDocumentListDto } from '@shared/service-proxies/service-proxies';
//
import { AfterViewChecked, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import {
    CreateOrUpdateUserInput,
    OrganizationUnitDto,
    PasswordComplexitySetting,
    ProfileServiceProxy,
    UserEditDto,
    UserRoleDto,
    UserServiceProxy,
    GetUserForEditOutput,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
    IOrganizationUnitsTreeComponentData,
    OrganizationUnitsTreeComponent,
} from '@app/admin/shared/organization-unit-tree.component';
import { map as _map, filter as _filter } from 'lodash-es';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { DateTime } from 'luxon';
import { finalize } from 'rxjs/operators';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgModel } from '@angular/forms';
//

@Component({
    selector: 'createOrEditUserModal',
    templateUrl: './documents.component.html',
    animations: [appModuleAnimation()],
    styleUrls: ['create-or-edit-user-modal.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class DocumentsComponent extends AppComponentBase implements OnInit {

    documents: DocumentListDto[] = [];
    filter: string = '';

    constructor(
        injector: Injector,
        private _DocumentService: DocumentServiceProxy,
        private _userService: UserServiceProxy,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);
        this.datepickerConfig = {
            containerClass: 'theme-dark-blue',
            dateInputFormat: 'DD/MM/YYYY',
        };
    }

    ngOnInit(): void {
        this.getDocuments();
    }

    getDocuments(): void {
        this._DocumentService.getDocuments(this.filter).subscribe((result) => {
            this.documents = result.items;
        });
    }
    /////
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('organizationUnitTree') organizationUnitTree: OrganizationUnitsTreeComponent;

    @ViewChild('createOrEditModal', { static: true }) createOrEditModal: ModalDirective;

    @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
    @ViewChild('editHistoryModal') editHistoryModal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    active = false;
    saving = false;
    canChangeUserName = true;
    isTwoFactorEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled');
    isLockoutEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.UserLockOut.IsEnabled');
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();

    user: UserEditDto = new UserEditDto();
    roles: UserRoleDto[];
    sendActivationEmail = true;
    setRandomPassword = true;
    passwordComplexityInfo = '';
    profilePicture: string;

    allOrganizationUnits: OrganizationUnitDto[];
    memberedOrganizationUnits: string[];
    userPasswordRepeat = '';

    selectedFileName: string = '';

    datepickerConfig: Partial<BsDatepickerConfig>;
    public startDate: Date = new Date();
    public endDate: Date = new Date();
    documentViewerSource: string = '';

    documentType: string;
    fileSize: string = '';

    showEditHistory: boolean = false;

    selectedFiles: File[] = [];

    show(userId?: number): void {
        if (!userId) {
            this.active = true;
            this.setRandomPassword = true;
            this.sendActivationEmail = true;
        }

        this._userService.getUserForEdit(userId).subscribe((userResult) => {
            this.user = userResult.user;
            this.roles = userResult.roles;
            this.canChangeUserName = this.user.userName !== AppConsts.userManagement.defaultAdminUserName;

            this.allOrganizationUnits = userResult.allOrganizationUnits;
            this.memberedOrganizationUnits = userResult.memberedOrganizationUnits;

            this.getProfilePicture(userId);

            if (userId) {
                this.active = true;

                setTimeout(() => {
                    this.setRandomPassword = false;
                }, 0);

                this.sendActivationEmail = false;
            }

            this._profileService.getPasswordComplexitySetting().subscribe((passwordComplexityResult) => {
                this.passwordComplexitySetting = passwordComplexityResult.setting;
                this.setPasswordComplexityInfo();
                this.modal.show();
            });
        });
    }
    setPasswordComplexityInfo(): void {
        this.passwordComplexityInfo = '<ul>';

        if (this.passwordComplexitySetting.requireDigit) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireDigit_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireLowercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireLowercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireUppercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireUppercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireNonAlphanumeric) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireNonAlphanumeric_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requiredLength) {
            this.passwordComplexityInfo +=
                '<li>' +
                this.l('PasswordComplexity_RequiredLength_Hint', this.passwordComplexitySetting.requiredLength) +
                '</li>';
        }

        this.passwordComplexityInfo += '</ul>';
    }

    getProfilePicture(userId: number): void {
        if (!userId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            return;
        }

        this._profileService.getProfilePictureByUser(userId).subscribe((result) => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            } else {
                this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            }
        });
    }

    onShown(): void {
        this.organizationUnitTree.data = <IOrganizationUnitsTreeComponentData>{
            allOrganizationUnits: this.allOrganizationUnits,
            selectedOrganizationUnits: this.memberedOrganizationUnits,
        };

        document.getElementById('Name').focus();
    }

    save(): void {
        let input = new CreateOrUpdateUserInput();

        input.user = this.user;
        input.setRandomPassword = this.setRandomPassword;
        input.sendActivationEmail = this.sendActivationEmail;
        input.assignedRoleNames = _map(
            _filter(this.roles, { isAssigned: true, inheritedFromOrganizationUnit: false }),
            (role) => role.roleName
        );

        input.organizationUnits = this.organizationUnitTree.getSelectedOrganizations();

        this.saving = true;
        this._userService
            .createOrUpdateUser(input)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.userPasswordRepeat = '';
        this.modal.hide();
    }

    getAssignedRoleCount(): number {
        return _filter(this.roles, { isAssigned: true }).length;
    }

    isSMTPSettingsProvided(): boolean {
        return !(
            this.s('Abp.Net.Mail.DefaultFromAddress') === '' ||
            this.s('Abp.Net.Mail.Smtp.Host') === '' ||
            this.s('Abp.Net.Mail.Smtp.UserName') === '' ||
            this.s('Abp.Net.Mail.Smtp.Password') === ''
        );
    }
    // Example in your component.ts file
    addFunction() {
        // Implement the logic for the "Thêm" button click
    }

    desFunction() {
        // Implement the logic for the "Huỷ" button click
        this.selectedFiles = [];
    }

    // Example in your component.ts file
    openFileExplorer(fileInput: any): void {
        if (fileInput) {
            fileInput.click();
        }
    }

    fileSelected(event: any): void {
        const fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            const selectedFile: File = fileList[0];
            const allowedFileTypes = ['.doc', '.docx', '.pdf'];

            // Check if the selected file is of an allowed type
            const fileExtension = selectedFile.name.split('.').pop();
            if (allowedFileTypes.includes('.' + fileExtension.toLowerCase())) {
                // TODO: Handle the selected file here
                console.log('Selected file:', selectedFile);
            } else {
                // Notify the user about the invalid file type
                console.error('Invalid file type. Please select a .doc, .docx, or .pdf file.');
            }
        }
    }

    onFileSelected(event: any): void {

        const files: FileList = event.target.files;

        // Convert FileList to array
        for (let i = 0; i < files.length; i++) {
            this.selectedFiles.push(files[i]);
        }

    }

    // Method to format file size from bytes to KB or MB
    formatFileSize(bytes: number): string {
        if (bytes == 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    //remove file number i
    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    getFileExtension(filename: string): string {
        return filename.split('.').pop(); // Trích xuất phần mở rộng từ tên file
    }

    getFileTypeIcon(filename: string): string {
        const extension = this.getFileExtension(filename); // Lấy phần mở rộng của tên file
        if (extension === 'pdf') {
            return 'assets/icons/pdf.png';
        } else if (extension === 'docx') {
            return 'assets/icons/docx.png';
        } else {
            return 'assets/icons/doc.png';
        }
    }
    /////
}



////////////////////
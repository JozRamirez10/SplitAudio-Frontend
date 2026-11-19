import { inject, Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { SpinnerTypes } from '@ionic/core';
import { addIcons } from 'ionicons';
import { alertCircleOutline, checkmarkCircleOutline, closeOutline, informationCircleOutline } from 'ionicons/icons';
import { ALERTS, APP_UI, GENERAL, MODAL_MESSAGES, MODAL_TITLES, SPINNERS, TOAST } from '../constants/constants';
import { ModalActions } from '../enums/modal.actions.enum';
import { ModalPresent } from '../enums/modal.present.enum';

interface ModalConfig {
    type: ModalPresent;
    title?: string;
    message?: string;
    spinner?: SpinnerTypes;
    color?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {

    private readonly alertCtrl = inject(AlertController);
    private readonly toastCtrl = inject(ToastController);
    private readonly loadingCtrl = inject(LoadingController);

    private loading: HTMLIonLoadingElement | null = null;
    private activeAlert: HTMLIonAlertElement | null = null;

    private readonly actionConfig: Record<ModalActions, ModalConfig> = {
        [ModalActions.LOADING]: { type: ModalPresent.LOADING, message: MODAL_MESSAGES.LOADING, spinner: SPINNERS['CRESCENT'] },

        [ModalActions.DELETE_SUCCESS]: { type: ModalPresent.TOAST, message: MODAL_MESSAGES.DELETE_SUCCESS, color: TOAST.COLOR_SUCCESS },
        [ModalActions.ERROR_DELETE]: { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_DELETE, color: TOAST.COLOR_ERROR },
        [ModalActions.ERROR_SONG_LOADING]: { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_SONG_LOADING, color: TOAST.COLOR_ERROR },
        [ModalActions.ERROR_DOWNLOAD]: { type: ModalPresent.TOAST, message: MODAL_MESSAGES.ERROR_DOWNLOAD, color: TOAST.COLOR_ERROR },

        [ModalActions.ERROR_CONNECTION]: { type: ModalPresent.ALERT, title: MODAL_TITLES.ERROR_CONNECTION, message: MODAL_MESSAGES.ERROR_CONNECTION },
        [ModalActions.ERROR_SERVER]: { type: ModalPresent.ALERT, title: MODAL_TITLES.ERROR_SERVER, message: MODAL_MESSAGES.ERROR_SERVER },

        [ModalActions.CUSTOM]: { type: ModalPresent.ALERT }
    };

    constructor() {
        addIcons({
            informationCircleOutline, alertCircleOutline, checkmarkCircleOutline, closeOutline
        });
    }

    async showModal(action: ModalActions, customTitle?: string, customText?: string): Promise<void> {
        const config = this.actionConfig[action];
        if (!config) return;

        switch (config.type) {
            case ModalPresent.LOADING:
                await this.presentLoading(config.message!, config.spinner!);
                break;
            case ModalPresent.TOAST:
                await this.presentToast(customText || config.message!, config.color || TOAST.COLOR_DEFAULT);
                break;
            case ModalPresent.ALERT:
                await this.presentAlert(customTitle || config.title, customText || config.message);
                break;
        }
    }

    private async presentLoading(message: string, spinner: SpinnerTypes): Promise<void> {
        await this.dismissLoading();
        this.loading = await this.loadingCtrl.create({
            message,
            spinner,
            backdropDismiss: false
        });
        await this.loading.present();
    }

    private async presentToast(message: string, color: string): Promise<void> {
        let iconName = 'information-circle-outline';
        if (color === TOAST.COLOR_ERROR) iconName = 'alert-circle-outline';
        if (color === TOAST.COLOR_SUCCESS) iconName = 'checkmark-circle-outline';

        const toast = await this.toastCtrl.create({
            message,
            color: color,
            icon: iconName,
            duration: TOAST.DURATION,
            position: TOAST.TOP_POSITION,
            cssClass: TOAST.CSS_CLASS,
            buttons: [
                {
                    role: 'cancel',
                    icon: 'close-outline'
                }
            ]
        });
        await toast.present();
    }

    private async presentAlert(title?: string, message?: string): Promise<void> {
        if (this.activeAlert) {
            await this.activeAlert.dismiss();
        }

        this.activeAlert = await this.alertCtrl.create({
            header: title || GENERAL.EMPTY_STRING,
            message: message || GENERAL.EMPTY_STRING,
            cssClass: 'custom-alert',
            buttons: [APP_UI.OK]
        });

        await this.activeAlert.present();
        this.activeAlert.onDidDismiss().then(() => this.activeAlert = null);
    }

    async confirmDelete(): Promise<boolean> {
        if (this.activeAlert) {
            await this.activeAlert.dismiss();
        }

        this.activeAlert = await this.alertCtrl.create({
            header: ALERTS.DELETE_TITLE,
            message: ALERTS.DELETE_MESSAGE,
            cssClass: 'custom-alert',
            buttons: [
                {
                    text: APP_UI.CANCEL,
                    role: ALERTS.ROLE_CANCEL,
                    cssClass: ALERTS.CSS_CLASS_CANCEL,
                },
                {
                    text: ALERTS.CONFIRM_DELETE,
                    role: ALERTS.ROLE_CONFIRM,
                    cssClass: ALERTS.CSS_CLASS_CONFIRM,
                }
            ]
        });

        await this.activeAlert.present();
        const result = await this.activeAlert.onDidDismiss();
        this.activeAlert = null;

        return result.role === ALERTS.ROLE_CONFIRM;
    }

    async dismissLoading(): Promise<void> {
        if (this.loading) {
            await this.loading.dismiss();
            this.loading = null;
        }
    }

    isAlertVisible(): boolean {
        return this.activeAlert !== null;
    }
}
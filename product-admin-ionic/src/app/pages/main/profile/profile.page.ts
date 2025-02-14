import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  /* ========== Tomar/Seleccionar Imagen ========== */
  async takeImage() {
    let user = this.user();
    let path = `users/${user.uid}`; 

    const dataUrl = (await this.utilsSvc.takePicture('imagen del Perfil')).dataUrl; 

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = `${user.uid}/profile`;
    user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);

    this.firebaseSvc.updateDocument(path, {image: user.image}).then(async res => {

      this.utilsSvc.saveInLocalStorage('user', user); 

      this.utilsSvc.presentToast({
        message: 'Imagen actualizada exitosamente',
        duration: 2500,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle-outline'
      })
      
    })
      .catch(error => { 
        console.log(error);

        this.utilsSvc.presentToast({
          message: 'La imagen no se pudo actualizar',
          duration: 2500,
          color: 'danger',
          position: 'top',
          icon: 'alert-circle-outline'
        })
      })
        .finally(() => {
          loading.dismiss();
        })
  }
}
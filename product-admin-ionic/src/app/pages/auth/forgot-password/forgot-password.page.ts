import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService); 
  
  async submit() {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading();
      await loading.present(); 

      this.firebaseSvc.sendRecoveryEmail(this.form.value.email).then( res => {
      
        this.utilsSvc.presentToast({
          message: 'Correo para cambiar la contraseña enviado con éxito',
          duration: 1500,
          color: 'success',
          position: 'top',
          icon: 'alert-circle-outline'
        });

        this.utilsSvc.routerLink('/auth');
        this.form.reset();

      })
        .catch(error => { 
          console.log(error);

          this.utilsSvc.presentToast({
            message: 'El correo no existe',
            duration: 1500,
            color: 'danger',
            position: 'top',
            icon: 'alert-circle-outline'
          });
        })
          .finally(() => {
            loading.dismiss();
          })
    }
  }
}
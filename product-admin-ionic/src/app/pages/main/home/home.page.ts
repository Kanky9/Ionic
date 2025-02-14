import { Component, inject } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { orderBy } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  firebaseSvc = inject(FirebaseService); 
  utilSvc = inject(UtilsService);

  products: Product[] = []; 

  loading: boolean = false; 

  user(): User {
    return this.utilSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getProducts();
  }

  /* ========== Refrescar página ========== */

  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  /* ========== Obtener ganancias ========== */
  
  getProfits() {
    return this.products.reduce((index, product) => index + product.price * product.soldUnits, 0);
  }

  /* ========== Obtener productos ========== */
  getProducts() {
    let path = `users/${this.user().uid}/products`;
    
    this.loading = true;

    let query = [
      orderBy('soldUnits', 'desc'),
      //where('soldUnits', '>', 30) muestra los productos con mas de 30 ventas
    ]

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => { 
        console.log(res); 
        this.products = res; 

        this.loading = false;

        sub.unsubscribe();
       }
    });
  }

  /* ========== Agregar o actualizar producto ========== */
  async addUpdateProduct(product?: Product) {

    let success = await this.utilSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: "add-update-modal",
      componentProps: { product }
    });

    if (success) this.getProducts();
  }

  /* ========== confirmar eliminación del producto ========== */

  async confirmDeleteProduct(product: Product) {
    this.utilSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres eliminar este producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.deleteProduct(product);
          }
        }
      ]
    });
  }

  /* ========== Eliminar Producto ========== */

  async deleteProduct(product: Product) {

    let path = `users/${this.user().uid}/products/${product.id}`;

    const loading = await this.utilSvc.loading();
    await loading.present(); 

    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath); 
    
    this.firebaseSvc.deleteDocument(path).then(async res => {

      this.products = this.products.filter(p => p.id !== product.id); 
      
      this.utilSvc.dismissModal({ success: true });

      this.utilSvc.presentToast({
        message: 'Producto eliminado exitosamente',
        duration: 2500,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle-outline'
      })
      
    })
      .catch(error => { 
        console.log(error);

        this.utilSvc.presentToast({
          message: 'El producto no se pudo eliminar',
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
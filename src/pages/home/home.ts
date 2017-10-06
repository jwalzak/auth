import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  displayName;
  items: FirebaseListObservable<any[]>;
  todo = {
    title: ''
  };

  constructor(public navCtrl: NavController, public afDB: AngularFireDatabase,
              public alertCtrl: AlertController,
              private  afAuth: AngularFireAuth, private fb: Facebook, 
              private platform: Platform){
      afAuth.authState.subscribe((user: firebase.User) => {
        if(!user) {
          this.displayName = `Please Login`;
          return;
        }
        this.displayName = `Hello ${user.displayName}`;
        this.items = afDB.list(`/items/${user.uid}`);
      });
    }
    
    signInWithFacebook() {
      if (this.platform.is('cordova')){
        return this.fb.login(['email', 'public_profile']).then(res => {
          const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
          return firebase.auth().signInWithCredential(facebookCredential);
        })
      }
      else {
        return this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then(res => console.log(res));
      }
    }
    
    signOut() {
      this.afAuth.auth.signOut();      
    }   
    
    addItem(value: string): void {
      this.items.push( this.todo.title);
    }

    showPrompt(key: string) {
      let prompt = this.alertCtrl.create({
        title: 'Delete or Update',
        message: 'Delete or update your task',
        inputs: [
          {
            name: 'Update',
            placeholder: 'Update',
          },
        ],
        buttons: [
          {
            text: 'Delete',
            handler: data => {
              this.items.remove(key);
            }
          },
          {
            text: 'Update',
            handler: data => {
              this.items.set(key, data.Update);
            }
          }
        ]
      });
      prompt.present();
    }
}

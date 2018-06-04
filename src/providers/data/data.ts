import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from 'angularfire2/firestore';
import { Observable } from "rxjs/Observable";
import * as firebase from 'firebase/app';

import { BehaviorSubject } from "rxjs/Rx";


// types

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

@Injectable()
export class DataProvider {

  constructor(private readonly afs: AngularFirestore) {
    
  }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp()
  }

  update<T>(ref: DocPredicate<T>, data: any) {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp
    })
  }

  set<T>(ref: DocPredicate<T>, data: any) {
    const timestamp = this.timestamp
    return this.doc(ref).set({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }

  add<T>(ref: CollectionPredicate<T>, data) {
    const timestamp = this.timestamp
    return this.col(ref).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }

  upsert<T>(ref: DocPredicate<T>, data: any) {
    const doc = this.doc(ref).snapshotChanges().take(1).toPromise()

    return doc.then(snap => {
      return snap.payload.exists ? this.update(ref, data) : this.set(ref, data)
    })
  }


  // return a reference

  col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
  }

  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
  }

  // return an observable

  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref).snapshotChanges().map(doc => {
      return doc.payload.data() as T;
    });
  }

  col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.col(ref, queryFn).snapshotChanges().map(docs => {
      return docs.map(a => a.payload.doc.data()) as T[];
    });
  }

 //deep copy
  //let newObj = JSON.parse(JSON.stringify(obj));
  clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  cloneObject(obj) {
    var clone = {};
    for (var i in obj) {
      if (obj[i] != null && typeof (obj[i]) == "object")
        clone[i] = this.cloneObject(obj[i]);
      else
        clone[i] = obj[i];
    }
    return clone;
  }

}

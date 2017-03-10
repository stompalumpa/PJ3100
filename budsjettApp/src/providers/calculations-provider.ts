import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable'
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import * as moment from 'moment';
import { DataLogger } from './data-logger';
import { FirebaseProvider } from './firebase-provider';
import * as fb from 'firebase';
import * as jquery from 'jquery';
export interface DataSnapshot extends fb.database.DataSnapshot{}
/*
  Generated class for the CalculationsProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/


@Injectable()
export class CalculationsProvider {

  currentUserUID;
  //TotalData for each category based on day/week/month:
  public sumAll;
  public sumAllFoodAndDrink;
  public sumAllClothes;
  public sumAllOther;
  constructor(public http: Http, private fbp: FirebaseProvider, public datalogger: DataLogger) {
    this.fbp.af.auth.subscribe(user => {
      if (user) {
        this.currentUserUID = user.uid;
      }
    });
  }


  //..........................................................................................................
  //This method can get the total amount of expenses, based on:
  //"Today", "current week" and "current month".
  sumTotalAll(date: string, filterBy: string): JQueryDeferred<Object> {
      let sumTotalAll = jquery.Deferred();
      let equal;
      let week = moment().isoWeek() + '';
      let year = moment().year();
      let month: any = moment().month()+1;
      month = (month < 10) ? '0' + month : month;
      let orderType: string;
      
      if(filterBy === "day") {
        orderType = "month"
        equal = month;
      } else if(filterBy === "week") {
        orderType ="week"
        equal = week;
        
        console.log("Vi er i uke: " + week);
      
      } else if(filterBy === "month") {
        orderType ="month"
        equal = month;
      }

      let queryObservable = this.fbp.af.database.list('/userData/' + this.currentUserUID + '/expense/', {
        query: {
          orderByChild: orderType,
          equalTo: equal
        }
      });

      var sumAll = 0;
      var sumAllFoodAndDrink = 0;
      var sumAllClothes = 0;
      var sumAllOther = 0;

      //KEEP...
      queryObservable
        .subscribe(x => {
          let length = x.length;
          let count = 0;
          x.forEach((i) => {
            count++;
            sumAll += i.amount;
            let categoryVal = i.category;
            let yearVal = i.year + '';
            console.log("Kategori på element: " + i.category);
            if (yearVal === year + ''){
              if(categoryVal === 'matOgDrikke') {
                sumAllFoodAndDrink += i.amount;
              } else if(categoryVal === "klærOgUtstyr") {
                sumAllClothes += i.amount;
              } else if(categoryVal === "annet") {
                sumAllOther += i.amount;
              }
            }
            console.log(length);
            console.log(count);
            console.log(sumAll);
            if (length == count) sumTotalAll.resolve();
          });
        });

        setTimeout(function() {
          sumTotalAll.reject('Could not get data in CalculationProvider.sumTotalAll()');
        }, 10000);

        sumTotalAll.then(() => {
          this.sumAll = sumAll;
          this.sumAllClothes = sumAllClothes;
          this.sumAllFoodAndDrink = sumAllFoodAndDrink;
          this.sumAllOther = sumAllOther;
          console.log("Total innen kategorien matOgDrikke: " + this.sumAllFoodAndDrink);
          console.log("Total innen kategorien klær: " + this.sumAllClothes);
          console.log("Total innen kategorien annet: " + this.sumAllOther);
          console.log("Total sum for alt: " + this.sumAll);
        });

        return sumTotalAll;
  }
}

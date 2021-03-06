import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { FirebaseListObservable, AngularFire } from 'angularfire2'

import { TimelineService } from '../../providers/timeline-service';



@Component({
  selector: 'page-tidslinje-for-kategori',
  templateUrl: 'tidslinje-for-kategori.html'
})
export class TidslinjeForKategori {

  private category: any;
  private fb_categoryPath: string;
  private headerTitle: string;
  private uniqueDates = [];
  private items: FirebaseListObservable<any>;

  public currentUser = firebase.auth().currentUser;

  constructor(public navParams: NavParams, private af: AngularFire, private fpb: TimelineService) {

    this.category = navParams.data;

    if (this.category.incomeOrExpense == 'income')
      this.headerTitle = 'Inntekter';

    else {
    var headerTitle_ = this.category.title.replace( /([A-Z])/g, " $1" );
    this.headerTitle = headerTitle_.charAt(0).toUpperCase() + headerTitle_.slice(1);
  }
  
      this.fb_categoryPath = 
        '/userData/' + this.currentUser.uid +
        '/' + this.category.incomeOrExpense;

     this.pushUniqueDates(this.uniqueDates);

     this.items = af.database.list(this.fb_categoryPath);

  }

  /* Pushes all date values in each object under the category, 
  ** and makes the array containing only unique values (dates), then sorts it out.
  */
  pushUniqueDates(arr: Array<any>){
    let flags:any = [];
    let count = 0;

    this.af.database.list(this.fb_categoryPath, { preserveSnapshot: true })
      .subscribe(snapshots => {
        snapshots.forEach(snapshot => {
          count++;
          console.log(snapshot.val().category, this.category.category);
          if (snapshot.val().category == this.category.category){
            let date: string = snapshot.val().date;
            if(flags[date]) return;
            flags[date] = true;
            arr.push(date);
          }
        });
        arr.sort();
      });
  }

  ionViewDidLoad() {
    console.log(
      '/' + this.category.incomeOrExpense + 
      '/' + this.category.title
    );
  }

}


import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Client, Collaborator, Knowledge } from '../../assignment-occupation/assignment-occupation.types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AssingmentOccupationService } from "../assingment-occupation.service";
import { Observable, Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { CollaboratorsService } from '../../collaborators/collaborators.service';


@Component({
  selector: 'app-detail-assignment',
  templateUrl: './detail-assignment.component.html',
  styleUrls: ['./detail-assignment.component.scss']
})
export class DetailAssignmentComponent implements OnInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    collaborators$: Observable<Collaborator[]>;
    initialState : any = [[], []];
    initialStateAux : any = [[], []];
    clients: Client[];
    knowledges: Knowledge[];
    filterCollaboratorForm: FormGroup;
    collaborators: any[];
    clients$: Observable<Client[]>;
    knowledges$: Observable<Knowledge[]>;
    leaders$: Collaborator[];
    viewDetail: boolean = false;
    openPanelClient : boolean = false;
    openPanelKnowledges : boolean = false;
    occupationState: number = 0;
    leaders: any[] = [];
    selectedLeaders: any[] = [];
    selectedCollaborators: any[] = [];
    selectedCollaboratorsList: any[] = [];

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    constructor(
        private _assingmentOccupationService: AssingmentOccupationService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _collaboratorsService : CollaboratorsService
    ) { }

    ngOnInit(): void {

        this.collaborators$ = this._assingmentOccupationService.collaboratorsAssign$
          .pipe(takeUntil(this._unsubscribeAll));

        this.clients$ = this._assingmentOccupationService.clients$
          .pipe(takeUntil(this._unsubscribeAll));

        this.knowledges$ = this._assingmentOccupationService.knowledges$
          .pipe(takeUntil(this._unsubscribeAll));

        // Create form group for filter collaborators
        this.filterCollaboratorForm = this._formBuilder.group({
          period: ['', [Validators.required]],
          department: ['', [Validators.required]],
        });

        this._assingmentOccupationService.collaboratorsAssign$
          .pipe(first())
            .subscribe(collaborators => {
            

              this.collaborators = collaborators;

              if ( this.collaborators ) {
                this.selectedCollaborators = this.collaborators.map(item => {
                  return {
                      selected: false,
                      ...item,
                      name: item.name + ' ' + item.lastName,
                  }
                });
              }

              //this.collaborators = [...this.selectedCollaborators];
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


            this._collaboratorsService.getLeadersList()
              .pipe(first())
                .subscribe((leaders: any[]) => {
                    this.leaders = leaders;
                    
                    if ( this.leaders ) {
                      this.selectedLeaders = this.leaders.map(item => {
                        return {
                            selected: false,
                            ...item,
                            name: item.name + ' ' + item.lastName,
                        }
                      });
                    }
  
                //this.leaders = [...this.selectedLeaders];
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

         this.initialPanel();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Methods
    // -----------------------------------------------------------------------------------------------------

    /**
    * handleEventFilter 
    * 
    */
    handleEventFilter(filterValues) {
        this._assingmentOccupationService.filterState = filterValues;
        //this.initialState = [...this._assingmentOccupationService.filterState];
        this.initialStateAux = [...this._assingmentOccupationService.filterState];
      
        this._assingmentOccupationService.filterOpenClients = filterValues[0].length > 0 ? true : false;

        this.openPanelClient = this._assingmentOccupationService.filterOpenClients;

        this._assingmentOccupationService.filterOpenKnowledges = filterValues[1].length > 0 ? true : false;
        this.openPanelKnowledges = this._assingmentOccupationService.filterOpenKnowledges;

        this._assingmentOccupationService.occupationState = filterValues[2] > 0 ? filterValues[2] : 0;

        this.occupationState = this._assingmentOccupationService.occupationState;
        
        const leaders = (this.selectedLeaders.filter(leader =>  leader.selected)).map(leader => leader.id);
        const collaborators = (this.selectedCollaborators.filter(collaborator =>  collaborator.selected)).map(collaborator => collaborator.id);
        
        this._assingmentOccupationService.getFilterCollaborator(
            filterValues[0],
            filterValues[1],
            filterValues[2],
            filterValues[3],
            filterValues[4],
            null,
            leaders,
            collaborators,
          )
          .subscribe((response) => {
            this._assingmentOccupationService.collaboratorsSelectedTwo = this.selectedCollaboratorsList.length > 0 ? this.selectedCollaboratorsList : [];
            this.selectedCollaboratorsList = [];
            this._assingmentOccupationService.setCollaboratorsAssign(response);
          });
    }


    /**
    * goDetail
    * 
    */
    goDetail() {
        this.initialState = this.initialStateAux;
        this.selectedCollaboratorsList = this._assingmentOccupationService.collaboratorsSelectedTwo;
        this.viewDetail = !this.viewDetail;
        this._assingmentOccupationService.setCollaboratorSelectedTwo();        
    }

    /**
    * initialPanel
    * 
    */
    initialPanel(){
        this.initialState = [[], []];
        this._assingmentOccupationService.filterState = [];
        this._assingmentOccupationService.allCollaborators = false;
        this._assingmentOccupationService.occupationState = 0;
        this._assingmentOccupationService.filterOpenClients = false;
        this._assingmentOccupationService.filterOpenKnowledges = false;
        this._assingmentOccupationService.collaboratorsSelectedTwo = [];
    }

   /**
    * ilterListCollaborator
    * 
    */
    filterListCollaboratorByLider(selectedLeaders: any[]){
        this.selectedLeaders = [...selectedLeaders];
        this.handleEventFilter(this._assingmentOccupationService.filterState);
   }

   /**
    * ilterListCollaborator
    * 
    */
    filterListCollaborator(selectedCollaborators: any[]){
        this.selectedCollaborators = [...selectedCollaborators];
        this.handleEventFilter(this._assingmentOccupationService.filterState);
    }

}

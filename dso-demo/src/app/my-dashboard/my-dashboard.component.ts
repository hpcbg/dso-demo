import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { ConnectivityService } from '../services/connectivity.service';

@Component({
  selector: 'app-my-dashboard',
  templateUrl: './my-dashboard.component.html',
  styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent {

  /** Based on the screen size, switch from standard to one column per row */
  cards = [
    { title: 'Test Comminication', cols: 2, rows: 3 }]

  isConnected: boolean = false;
  connectorCreated: boolean = false;
  testCompleted: boolean = false;
  interactionCreated: boolean = false;
  pendingResponse: boolean = false;
  pollingStarted: boolean = false;

  graphPattern: string = "?a <http://example.org/isRelatedTo> ?b .";
  bindingSet: string = `[{"a":"12","b":"23"}]`;
  knowledgeBaseId: string = "";
  askRequest: string = "";

  handleRequestId: number = 0;

  constructor(private cService: ConnectivityService) { }

  ngOnInit(): void {
    this.knowledgeBaseId = "https://ke.interconnectproject.eu/rest/adapter/HPC-Ask";
  }

  testConnect() {
    this.cService.serviceStoreLogin(() => {
      this.isConnected = true;
      this.cService.smartConnectorCreate(() => {
        this.connectorCreated = true;
      });
    });
  }

  testRegisterInteraction() {
    this.interactionCreated = false;
    this.pollingStarted = false;
    this.cService.smartConnectorRegisterInteraction(this.graphPattern, (success: any) => {
      if (success) {
        this.interactionCreated = true;
      }
    });
  }

  handleStart() {
    this.pendingResponse = true;
    this.cService.smartConnectorHandleStart((data: any) => {
      console.log(data);
      this.handleRequestId = data.handleRequestId;
      this.pendingResponse = false;
      this.askRequest = JSON.stringify(data);
      this.pollingStarted = true;
    });
  }

  handleSend() {
    console.log(this.bindingSet);
    this.cService.smartConnectorHandleSend(this.handleRequestId, JSON.parse(this.bindingSet), () => {

    })
  }
}

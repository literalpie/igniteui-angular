import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxSplitBarComponent } from './splitter-bar/splitter-bar.component';
import { IgxSplitterPaneComponent } from './splitter-pane/splitter-pane.component';
import { IgxSplitterComponent } from './splitter.component';
import { IgxIconModule } from '../icon/index';
import { IgxDragDropModule } from '../directives/drag-drop/drag-drop.directive';

@NgModule({
    imports: [
        CommonModule, IgxIconModule, IgxDragDropModule
    ],
    declarations: [
        IgxSplitterComponent,
        IgxSplitterPaneComponent,
        IgxSplitBarComponent
    ],
    exports: [
        IgxSplitterComponent,
        IgxSplitterPaneComponent
    ]
})
export class IgxSplitterModule { }

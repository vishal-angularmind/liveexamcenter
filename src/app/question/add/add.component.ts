import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import { ManageQuestionsService } from 'src/app/manage-questions.service';
import { options } from 'src/app/options';



@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {

  @ViewChild('enable', { static: true }) enable!: ElementRef
  // @ViewChild('option', { static: true }) option!: ElementRef<HTMLInputElement>

  // options = new options()
  // optionArray:any = []

  changedEditor(event: EditorChangeContent | EditorChangeSelection) {

  }
  rowClicked: any;
  hideNavBar = false
  isDuplicate = false
  wrongMarks = 0;
  rightMarks = 1;
  diffLevel = "Easy";
  optionValue:any = []
  topic ="";
  selectedoption = true;
  submitted = false;
  isSelected = true;
  temp = -1;
  isOptionSelected = true;
  result: any = [];
  subjectArr: any = [];
  hiddenItems: any = {};
  topicArr: any = [];
  correctOptionSelected = false;
  // subject: any = []
  questionForm!: FormGroup;
  type = "MULTIPLE CHOICE";



  subject: any;

  questionType = [
    { id: 1, name: 'MULTIPLE CHOICE' },
    { id: 2, name: 'MULTIPLE RESPONSE' },
    { id: 3, name: 'FILL IN THE BLANKS' },

  ];

  difficultyLevel = [
    { id: 1, name: 'Easy' },
    { id: 2, name: 'Medium' },
    { id: 3, name: 'Hard' },

  ];


  constructor(private _questions: ManageQuestionsService, private _fb: FormBuilder, private toastr: ToastrService) { }

  public addMoreOption!: FormGroup;


  ngOnInit(): void {
    this.hideNavBar = false;
    this.submitted = false;
    this.correctOptionSelected = false;
    this.addMoreOption = this._fb.group({
      subject: ['', Validators.required],
      topic: ['', Validators.required],
      type: ['', Validators.required],
      diffLevel: ['', Validators.required],
      rightMarks: ['', Validators.required],
      wrongMarks: ['', Validators.required],
      questionText: ['', Validators.required],
      options: this._fb.array([this.initOptionRows(), this.initOptionRows(), this.initOptionRows(), this.initOptionRows()])
    });

    this._questions.getSubjectList().subscribe((res) => {

      this.result = res;
      this.subjectArr = this.result.result;
      console.log(this.subjectArr);
    })
  }


  get formArr() {
    return this.addMoreOption.get('options') as FormArray;
  }

  initOptionRows() {
    return this._fb.group({
      option: ['',[ Validators.required]],
      isCorrect: [false, Validators.required],
      richTextEditor: [false, Validators.required]
    });
  }

  topicList() {
    this._questions.getTopic(this.subject).subscribe((res) => {
      // console.log(res)
      this.topicArr = res;

    });

  }

  changeEditor() {
    this.isSelected = !this.isSelected;
    !this.isSelected ? this.enable.nativeElement.innerText = "disabled rich editor" : this.enable.nativeElement.innerText = "enabled rich editor"
    if (this.isSelected === false) {

    }
    else {

    }
  }
  changeOptionEditor(index: any, e: any) {


    this.hiddenItems[index] = !this.hiddenItems[index];
    console.log(this.hiddenItems[index]);
    this.hiddenItems[index] ? e.target.innerText = "Disabled rich editor" : e.target.innerText = "Enabled rich editor";
    if (this.hiddenItems[index]) {
      console.log(this.addMoreOption.value);
      this.addMoreOption.value.options[index].richTextEditor = true;
      
    }

    // this.addMoreOption.value.options[index].isCorrect = false
  }

  addOption() {
    this.formArr.push(this.initOptionRows());
  }

  removeOption(index: any) {
    this.formArr.removeAt(index);
  }

  change(e: any) {
    console.log(e.target.id);
  }
  onSubmit() {
    this.submitted = true;
    console.log(this.addMoreOption.value);
    if(this.addMoreOption.invalid || !this.correctOptionSelected || this.isDuplicate)
    {
      return
    }
    for (let i = 0; i < this.addMoreOption.value.options.length; i++) {
      if (/<(?=.*? .*?\/ ?>|br|hr|input|pre|p|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(this.addMoreOption.value.options[i].option)) {
        this.addMoreOption.value.options[i].richTextEditor = true;
      }
      else {
        this.addMoreOption.value.options[i].richTextEditor = false;
      }

    }

    console.log(this.addMoreOption.value);
    this._questions.postQuestion(this.addMoreOption.value).subscribe(
      data => console.log('success', data),
      error => console.error('error',error)

    );
    this.topic = this.addMoreOption.value.topic;
    this.subject = this.addMoreOption.value.subject;
    this.toastr.success('Data addded Successfully!');
   
    this.formArr.clear()
    for(let i = 0 ; i< 4 ; i++){
      this.formArr.push(this.initOptionRows());
    }
    this.addMoreOption.patchValue({questionText : ""});
    this.submitted = false;
    this.correctOptionSelected = false;
  }
  onSelect(e: any, index: any) {
    // e.target.checked = ""
    this.correctOptionSelected = true;
    console.log(e.target.checked);
    if (this.temp != -1) {
      this.addMoreOption.value.options[this.temp].isCorrect = false;
    }

    this.addMoreOption.value.options[index].isCorrect = true;
    this.temp = index;


  }

  duplicateOptionValidator(control: FormControl){
    let option = control.value;
    if (option && this.addMoreOption.value.options.includes(option)) {
      return {
        duplicateOption: {
          option: option
        }
      }
    }
    return null;
  }

  duplicateCheck(index:any, e: any){
    this.optionValue.push(e.target.value)
    console.log(this.optionValue)
    // let findDuplicates = (arr: any[]) => arr.filter((item, index) => arr.indexOf(item) != index)
    // let optionArray = findDuplicates(this.optionValue)
    // for(let i = 0; i<optionArray.length;i++)
    // {
      
    //   if(e.target.value === optionArray[i]){
    //     this.isDuplicate = true
    //   }
    //   else{
    //     console.log("no")
    //   }
    // }

   
  }

  hideShowNavBar(e:any){
    
    this.hideNavBar = !this.hideNavBar
  }
}

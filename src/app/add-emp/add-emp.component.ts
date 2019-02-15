import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from "@angular/forms";
import { EmployeeService } from '../service/employee.service';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-add-emp',
  templateUrl: './add-emp.component.html',
  styleUrls: ['./add-emp.component.css']
})
export class AddEmpComponent implements OnInit {

  empformlabel: string = 'Add Employee';
  empformbtn: string = 'Save';
  check: string;
  errdob: boolean = false;
  months: number;
  global: number;
  emailRegEx = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  roles = ['Software Engineer', 'Senior Software Engineer', 'Technical Architect', 'Senior Technical Architect'];
  constructor(private formBuilder: FormBuilder, private router: Router, private empService: EmployeeService, private route: ActivatedRoute) {
  }

  addForm: FormGroup;
  btnvisibility: boolean = true;
  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        this.check = params['type'];
        console.log(this.check);
      });

    this.addForm = this.formBuilder.group({
      id: [],
      employee_name: ['', Validators.required],
      employee_emailId: ['', [Validators.required, Validators.pattern(this.emailRegEx)]],
      employee_dob: ['', [Validators.required, this.dobValidator]],
      employee_role: ['', [Validators.required]],
      employee_doj: [''],
      employee_exp: ['']
    });

    this.formControlValueChanged();
    this.toSetExp();

    if (this.check == 'edit') {
      let empid = localStorage.getItem('editEmpId');
      if (+empid > 0) {
        this.empService.getEmployeeById(+empid).subscribe(data => {
          this.addForm.patchValue(data);
        })
        this.btnvisibility = false;
        this.empformlabel = 'Edit Employee';
        this.empformbtn = 'Update';
      }
    }
  }
  formControlValueChanged() {
    const dojControl = this.addForm.get('employee_doj');
    const expControl = this.addForm.get('employee_exp');
    this.addForm.get('employee_role').valueChanges.subscribe(
      (mode: string) => {
        console.log(mode);
        if ((mode === 'Technical Architect') || (mode === 'Senior Technical Architect')){
          dojControl.setValidators([Validators.required,this.dojValidator]);
          expControl.setValidators([Validators.required]);
        }
        else if ((mode === 'Software Engineer') || (mode === 'Senior Software Engineer')){
          dojControl.clearValidators();
          expControl.clearValidators();
        }
        dojControl.updateValueAndValidity();
        expControl.updateValueAndValidity();
      });
  }
  toSetExp(){
    const expControl = this.addForm.get('employee_exp');
    this.addForm.get('employee_doj').valueChanges.subscribe(
        (dojDate: Date) => {
          console.log(dojDate);
          let year = new Date(dojDate);
          let today = new Date();
          let month = today.getMonth() - year.getMonth();
          let months = ((month > 0) ? month : month * -1) + (12 * (today.getFullYear() - year.getFullYear()));
          if (months >= 12) {
            console.log('years:', (months - (months % 12)) / 12);
            expControl.setValue((months - (months % 12)) / 12 +' year');
          }
          expControl.updateValueAndValidity();
        }
    );
  }

  dobValidator(control: AbstractControl): { [key: string]: boolean } | null {

    if (control.value !== undefined && (isNaN(control.value))) {
      console.log('present')
      let year = new Date(control.value).getFullYear();
      console.log(year);
      let today = new Date().getFullYear();
      let diff = today - year;
      if (diff <= 18) {
        console.log('reached');
        return { 'dobError': true };
      }
    }
    return null;
  }
  dojValidator(control: AbstractControl): { [key: string]: boolean } | null {

    if (control.value !== undefined && (isNaN(control.value))) {
      console.log('doj present')
      let year = new Date(control.value);
      console.log(year);
      let today = new Date();
      console.log(today);
      if (year > today) {
        console.log('dojReached');
        return { 'dojError': true };
      }
    }
    return null;
  }

  onSubmit() {
    console.log('Create fire');
    this.empService.createUser(this.addForm.value)
      .subscribe(data => {
        this.router.navigate(['list-emp']);
      },
        error => {
          alert(error);
        });
  }
  onUpdate() {
    console.log('Update fire');
    this.empService.updateEmployee(this.addForm.value).subscribe(data => {
      this.router.navigate(['list-emp']);
    },
      error => {
        alert(error);
      });
  }
}  

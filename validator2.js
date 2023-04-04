function Validator(formSelector, options= {}) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var formRules= {}

 /**
  * Quy ước tạo rule:
  * - Nếu có lỗi -> return lỗi
  * - nếu k có lỗi -> return undefine
  */
    var validatorRules= {
        required: function(value){
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email : function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function(min){ 
            return   function(value){
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`
            }
        },
        max: function(max){ 
            return   function(value){
                return value.length <= max ? undefined : `Vui lòng nhập nhiều nhất ${max} ký tự`
            }
        }
    };
    // Láy ra form element trong dom
   var formElement = document.querySelector(formSelector);

   // chỉ xử lý nếu có element
   if (formElement) {

      var inputs = formElement.querySelectorAll('input[name][rules]');

      for (var input of inputs) {

            var ruleInfo;
            var rules =  input.getAttribute('rules').split('|');

            for (var rule of rules) {
                var ruleHasValue = rule.includes(':');
                if(ruleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0]
                }
                var ruleFunc = validatorRules[rule];
            if (ruleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

            if (Array.isArray(formRules[input.name])) {
                formRules[input.name].push(ruleFunc);
            } else {
                formRules[input.name] = [ruleFunc];
            }
            } 

        // Lắng nghe các sự kiện
        input.onblur = handleValidate;
        input.oninput = handleClearErrors;
      }

      // Hàm thực hiện validate
      function handleValidate(event) {
        var rules = formRules[event.target.name];
        var errorMesage 
         rules.some(function (rule) {
           errorMesage= rule(event.target.value);
           return errorMesage;
        })
        if (errorMesage) {
          var formGroup = getParent(event.target, '.form-group')
          if (formGroup){
            var formMessage = formGroup.querySelector('.form-message');
            if(formMessage){
                formMessage.innerText = errorMesage;
                formGroup.classList.add('invalid')
            }
          }
        }
        return !errorMesage;
      }

      function handleClearErrors(event){
        var formGroup = getParent(event.target, '.form-group');
        if (formGroup.classList.contains('invalid')){
            formGroup.classList.remove('invalid')
            var formMessage = formGroup.querySelector('.form-message');
            if(formMessage){
                formMessage.innerText = '';
            }
        }
      }

   
   }

   // xử lý hành vi submit
   formElement.onsubmit = function(event) {
    event.preventDefault();
    var inputs = formElement.querySelectorAll('input[name][rules]');
    var isValid = true;
      for (var input of inputs) {
        if (!handleValidate({target: input })){
            isValid= false;
        }
      }

      //Khi k có lỗi -> submit
      if (isValid){
            

        var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                               if (input.matches(':checked')) {
                                values[input.name] = input.value;
                               }
                                break;
                            case 'checkbox':
                                    if (!input.matches(':checked')) {
                                        values[input.name] = ""
                                        return values 
                                    }
                                    if (!Array.isArray(values[input.name]) ) {
                                        values[input.name] = [];
                                    }
                                    values[input.name].push(input.value);
                                    break;
                            case 'file' :
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        
                        return values;
                    },{});
            if(typeof options.onSubmit === 'function'){
                options.onSubmit(formValues);
            } else {
                formElement.submit();
            }
      }
   }
}
// constructor function
function Validator(options) {

    function getParent(element,selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
       
    }
    // Lưu lại các rules
    var selectorRules = {}

    // Hàm thực hiện validate
    function validate (inputElement, rule) {
                // value người dùng nhập inputElement.value;
                // test func : rule.test
                   // thẻ cha: parentElement
                var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
                var errorMesage ;

                // Lấy ra các rules của selector
                var rules = selectorRules[rule.selector]
                // Lập qua các rule và check
                for (var i = 0; i < rules.length; ++i) {
                    switch (inputElement.type){
                        case 'radio':
                        case 'checkbox':
                            errorMesage=  rules[i](formElement.querySelector(rule.selector + ':checked'));
                             break;
                        default:
                            errorMesage=  rules[i](inputElement.value)
                    }
                    
                    if (errorMesage) break;
                }
                if (errorMesage) {
                  errorElement.innerHTML = errorMesage;
                 getParent(inputElement,options.formGroupSelector).classList.add('invalid');
  
                } else {
                  errorElement.innerHTML = ''
                 getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                }

                return !errorMesage;

    }

    // Lấy element cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {

        // Submit
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var  isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                if ( typeof options.onSubmit === 'function') {
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
                    options.onSubmit(formValues)
                } 
                // submit vơi hành vi mặc đinhh
                else {
                    formElement.submit();
                }
            }
           
            
        }


        // Xử lý lặp qua các rule
       options.rules.forEach(function(rule) {
        // Lưu lại các rules cho mỗi input 
        if( Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test)
        } else {
            selectorRules[rule.selector] = [rule.test]
        }

        var inputElements = formElement.querySelectorAll(rule.selector)
        Array.from(inputElements).forEach(function(inputElement){
            if (inputElement) {
                // xử lý blur
                inputElement.onblur = function() {
                  validate(inputElement, rule)
                }
    
                // Xử lý khi user nhập vào inputElement
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector('.form-message')
                    errorElement.innerHTML = ''
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                }
            }
        });
       
       })
    }


}

//Định nghĩa các rules
// nguyên tắc cua  rules
// 1: có lỗi  => message
// 2: hợp lệ => undefined
Validator.isRequired = function(selector, message){

    return {
        selector: selector,
        test: function(value){
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector, message){

    return {
        selector: selector,
        test: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email'
        }
    }

}

Validator.minLength = function(selector, min, message){

    return {
        selector: selector,
        test: function(value){
          return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`  
        }
    }

}
Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
           return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}
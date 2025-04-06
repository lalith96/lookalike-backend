
const {body,validationResult}=require('express-validator')

const signUpValidator=async (req,res,next)=>{


 // 1. Setup rules for validation.
    const rules = [
        body('email')
          .notEmpty()
          .withMessage('Email is required'),
        body('fullname')
          .notEmpty()
          .withMessage(
            'UserName is Required'
          ),
        body('password')
        .notEmpty().withMessage(
            'Password is Required'
          ),
        body('number')
        .notEmpty().withMessage(
            'Number is Required'
          ),
      ];

     // 2. run those rules.
    await Promise.all(
        rules.map((rule) => rule.run(req))
    );

    // 3. check if there are any errors after running the rules.
    var validationErrors = validationResult(req);
    console.log(validationErrors);

    // 4. if errros, return the error message
    if (!validationErrors.isEmpty()) {
       res.status(200).send({'success':true,"message":'Fields Missing',"result": validationErrors.array()[0].msg});
    }else{
      next();
    }
}

module.exports=signUpValidator
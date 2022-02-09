function sendsms(name, otp, number) {
  name = name.slice(0, 19);
  const message = `Hi ${name}, Your OTP for login to Lookalike is ${otp}. Valid for only 10 minutes. Please do not share OTP with others. Regards, Lookalike Team`;
  //   var url =
  //     `https://api.textlocal.in/send?apikey=${process.env.TXTLOCAL_APIKEY}&numbers=${number}&sender=FDLYTS&message=` +
  //     encodeURIComponent(message);
  axios
    .get(url)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

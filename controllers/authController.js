const passport = require('passport');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";

// Shivaji Update

const dotenv = require("dotenv");
const crypto = require("crypto");
const Razorpay = require("razorpay");
dotenv.config();

const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

//------------ User Model ------------//
const User = require('../models/User');

//------------ Register Handle ------------//
exports.registerHandle = (req, res) => {
    const { name, email, password, password2, idid, emaile } = req.body;
    let errors = [];

    //------------ Checking required fields ------------//
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    //------------ Checking password mismatch ------------//
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    //------------ Checking password length ------------//
    if (password.length < 8) {
        errors.push({ msg: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2,
            idid,
            emaile
        });
    } else {
        //------------ Validation passed ------------//
        const emailo = email.toLowerCase();
        User.findOne({ email : emailo }).then(user => {
            if (user) {
                //------------ User already exists ------------//
                errors.push({ msg: 'Email ID already registered' });
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                    idid,
                    emaile
                });
            } else {
                const oauth2Client = new OAuth2(
                    "857731231412-plbkoquiubgt5s2mt1cin82tu0au1jdk.apps.googleusercontent.com",
                    "JKgJCCeeHWDpZbR_zh_GF-RG",
                    "https://developers.google.com/oauthplayground" 
                );

                oauth2Client.setCredentials({
                    refresh_token: "1//04XV884bASMV4CgYIARAAGAQSNwF-L9IrXtSQ1JzygID3LsO5FAT-gbUGMiHKK3GNv-ue3iMnJDq6E38tt2U9fGOAqbQf4N7gauU"
                });
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ name, email, password, idid, emaile }, JWT_KEY, { expiresIn: '30m' });
                const CLIENT_URL = 'http://' + req.headers.host;

                const output = `
                <h2>Please click on below link to activate your account</h2>
                <p>${CLIENT_URL}/auth/activate/${token}</p>
                <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
                `;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: "OAuth2",
                        user: "tansengames7@gmail.com",
                        clientId: "857731231412-plbkoquiubgt5s2mt1cin82tu0au1jdk.apps.googleusercontent.com",
                        clientSecret: "JKgJCCeeHWDpZbR_zh_GF-RG",
                        refreshToken: "1//04XV884bASMV4CgYIARAAGAQSNwF-L9IrXtSQ1JzygID3LsO5FAT-gbUGMiHKK3GNv-ue3iMnJDq6E38tt2U9fGOAqbQf4N7gauU",
                        accessToken: accessToken
                    },
                });

                // send mail with defined transport object
                const mailOptions = {
                    from: '"TanSen" <tansengames7@gmail.com>', // sender address
                    to: email, // list of receivers
                    subject: "Account Verification: TanSen", // Subject line
                    generateTextFromHTML: true,
                    html: output, // html body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        req.flash(
                            'error_msg',
                            'Something went wrong on our end. Please register again.'
                        );
                        res.redirect('/auth/login');
                    }
                    else {
                        console.log('Mail sent : %s', info.response);
                        req.flash(
                            'success_msg',
                            'Activation link sent to email ID. Please activate to log in.'
                        );
                        res.redirect('/auth/login');
                    }
                })
            }
        });
    }
}

//------------ Activate Account Handle ------------//
exports.activateHandle = (req, res) => {
    const token = req.params.token;
    let errors = [];
    if (token) {
        jwt.verify(token, JWT_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please register again.'
                );
                res.redirect('/auth/register');
            }
            else {
                const { name, email, password, idid, emaile } = decodedToken;

                const emailx = email.toLowerCase();

                User.findOne({ email: emailx }).then(user => {
                    if (user) {
                        //------------ User already exists ------------//
                        req.flash(
                            'error_msg',
                            'Email ID already registered! Please log in.'
                        );
                        res.redirect('/auth/login');
                    } else {
                        if(idid) {
                            balance = 20
                            User.findOne({_id: idid}).then( userx => {
                                console.log(userx.balance),
                                console.log(userx.refcount),
                                console.log(userx.refbal)
                                User.findByIdAndUpdate(
                                    { _id: idid},
                                    { 
                                    $push:{ refto: email},
                                    refcount: parseInt(userx.refcount)+1,
                                    refbal: parseInt(userx.refbal)+2,
                                    balance: parseInt(userx.balance)+2
                                    },
                                    function (err, result) {
                                        if(err){
                                            console.log(err)
                                        } else {
                                            console.log("success")
                                        }
                                    }
                                )
                            })
                        } else {
                            balance = 10
                        }

                        const newUser = new User({
                            name,
                            email,
                            password,
                            balance,
                            reffrom: emaile
                        });
                        
                        bcryptjs.genSalt(10, (err, salt) => {
                            bcryptjs.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser
                                .save()
                                .then(user => {
                                    req.flash(
                                        'success_msg',
                                        'Account activated. You can now log in.'
                                    );
                                    res.redirect('/auth/login');
                                })
                                .catch(err => console.log(err));
                            });
                        });
                    }
                });
            }
        })
    }
    else {
        console.log("Account activation error!")
    }
}

//------------ Forgot Password Handle ------------//
exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    let errors = [];

    //------------ Checking required fields ------------//
    if (!email) {
        errors.push({ msg: 'Please enter an email ID' });
    }

    if (errors.length > 0) {
        res.render('forgot', {
            errors,
            email
        });
    } else {
        const emailz = email.toLowerCase();
        User.findOne({ email: emailz }).then(user => {
            if (!user) {
                //------------ User already exists ------------//
                errors.push({ msg: 'User with Email ID does not exist!' });
                res.render('forgot', {
                    errors,
                    email
                });
            } else {

                const oauth2Client = new OAuth2(
                    "857731231412-plbkoquiubgt5s2mt1cin82tu0au1jdk.apps.googleusercontent.com", // ClientID
                    "JKgJCCeeHWDpZbR_zh_GF-RG", // Client Secret
                    "https://developers.google.com/oauthplayground" // Redirect URL
                );

                oauth2Client.setCredentials({
                    refresh_token: "1//04XV884bASMV4CgYIARAAGAQSNwF-L9IrXtSQ1JzygID3LsO5FAT-gbUGMiHKK3GNv-ue3iMnJDq6E38tt2U9fGOAqbQf4N7gauU"
                });
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, { expiresIn: '30m' });
                const CLIENT_URL = 'http://' + req.headers.host;
                const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/auth/forgot/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
                `;

                User.updateOne({ resetLink: token }, (err, success) => {
                    if (err) {
                        errors.push({ msg: 'Error resetting password!' });
                        res.render('forgot', {
                            errors,
                            email
                        });
                    }
                    else {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: "OAuth2",
                                user: "tansengames7@gmail.com",
                                clientId: "857731231412-plbkoquiubgt5s2mt1cin82tu0au1jdk.apps.googleusercontent.com",
                                clientSecret: "JKgJCCeeHWDpZbR_zh_GF-RG",
                                refreshToken: "1//04XV884bASMV4CgYIARAAGAQSNwF-L9IrXtSQ1JzygID3LsO5FAT-gbUGMiHKK3GNv-ue3iMnJDq6E38tt2U9fGOAqbQf4N7gauU",
                                accessToken: accessToken
                            },
                        });

                        // send mail with defined transport object
                        const mailOptions = {
                            from: '"TanSen" <tansengames7@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: "Account Password Reset: TanSen", // Subject line
                            html: output, // html body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                req.flash(
                                    'error_msg',
                                    'Something went wrong on our end. Please try again later.'
                                );
                                res.redirect('/auth/forgot');
                            }
                            else {
                                console.log('Mail sent : %s', info.response);
                                req.flash(
                                    'success_msg',
                                    'Password reset link sent to email ID. Please follow the instructions.'
                                );
                                res.redirect('/auth/login');
                            }
                        })
                    }
                })
            }
        });
    }
}

//------------ Redirect to Reset Handle ------------//
exports.gotoReset = (req, res) => {
    const { token } = req.params;

    if (token) {
        jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please try again.'
                );
                res.redirect('/auth/login');
            }
            else {
                const { _id } = decodedToken;
                User.findById(_id, (err, user) => {
                    if (err) {
                        req.flash(
                            'error_msg',
                            'User with email ID does not exist! Please try again.'
                        );
                        res.redirect('/auth/login');
                    }
                    else {
                        res.redirect(`/auth/reset/${_id}`)
                    }
                })
            }
        })
    }
    else {
        console.log("Password reset error!")
    }
}


exports.resetPassword = (req, res) => {
    var { password, password2 } = req.body;
    const id = req.params.id;
    let errors = [];

    //------------ Checking required fields ------------//
    if (!password || !password2) {
        req.flash(
            'error_msg',
            'Please enter all fields.'
        );
        res.redirect(`/auth/reset/${id}`);
    }

    //------------ Checking password length ------------//
    else if (password.length < 8) {
        req.flash(
            'error_msg',
            'Password must be at least 8 characters.'
        );
        res.redirect(`/auth/reset/${id}`);
    }

    //------------ Checking password mismatch ------------//
    else if (password != password2) {
        req.flash(
            'error_msg',
            'Passwords do not match.'
        );
        res.redirect(`/auth/reset/${id}`);
    }

    else {
        bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(password, salt, (err, hash) => {
                if (err) throw err;
                password = hash;

                User.findByIdAndUpdate(
                    { _id: id },
                    { password },
                    function (err, result) {
                        if (err) {
                            req.flash(
                                'error_msg',
                                'Error resetting password!'
                            );
                            res.redirect(`/auth/reset/${id}`);
                        } else {
                            req.flash(
                                'success_msg',
                                'Password reset successfully!'
                            );
                            res.redirect('/auth/login');
                        }
                    }
                );

            });
        });
    }
}

// Shivaji Update
exports.editProfile = (req, res) => {
    var { name } = req.body;
    const id = req.params.id;
    let errors = [];

    User.findByIdAndUpdate(
        { _id: id },
        { name },
        function (err, result) {
            if (err) {
                req.flash(
                    'error_msg',
                    'Error updating profile!'
                );
                res.redirect(`/editt/${id}`);
            } else {
                req.flash(
                    'success_msg',
                    'Profile updated successfully!'
                );
                res.redirect('/profile');
            }
        }
    );
}

exports.changePasswd = (req, res) => {
    var { password, password1, password2 } = req.body;
    const id = req.params.id;
    let errors = [];

    bcryptjs.compare(password, req.user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
            // return done(null, user);
            //------------ Checking required fields ------------//
            if (!password || !password1 || !password2) {
                req.flash(
                    'error_msg',
                    'Please enter all fields.'
                );
                res.redirect(`/change/${id}`);
            }

            //------------ Checking password length ------------//
            else if (password.length < 8) {
                req.flash(
                    'error_msg',
                    'Password must be at least 8 characters.'
                );
                res.redirect(`/change/${id}`);
            }

            //------------ Checking password mismatch ------------//
            else if (password1 != password2) {
                req.flash(
                    'error_msg',
                    'Passwords do not match.'
                );
                res.redirect(`/change/${id}`);
            }

            else {
                bcryptjs.genSalt(10, (err, salt) => {
                    bcryptjs.hash(password1, salt, (err, hash) => {
                        if (err) throw err;
                        password1 = hash;

                        User.findByIdAndUpdate(
                            { _id: id },
                            { password: password1 },
                            function (err, result) {
                                if (err) {
                                    req.flash(
                                        'error_msg',
                                        'Error changing password!'
                                    );
                                    res.redirect(`/change/${id}`);
                                } else {
                                    req.flash(
                                        'success_msg',
                                        'Password changed successfully!'
                                    );
                                    res.redirect('/profile');
                                }
                            }
                        );
                    });
                });
            }
        } else {
            return done(null, false, { message: 'Password incorrect! Please try again.' });
        }
    });
}

exports.reflink = (req, res) => {
    const waddas = 'http://' + req.headers.host;
    const idid = req.user._id;
    const emaile = req.user.email;
    const ref_link = `${waddas}/auth/register?idid=${idid}&emaile=${emaile}`
    req.flash(
        'pro_msg',
        `${ref_link}`
    )
    res.redirect('/reflink');
}

exports.dynamic = (req, res) => {
    const email = req.body.wallah
    User.findOne({email: email}).then( userz => {
        req.flash(
            'pro_msg',
            `Email: ${email},
            Username: ${userz.name},
            Balance: ₹${userz.balance},
            Invitation Reward: ₹${userz.refbal},
            Total Invitee: ${userz.refcount}`
        );
        res.redirect(`/dynamic/${email}`);
    })
}

exports.game1 = (req, res) => {
    var { amount, choice, wow, today } = req.body; 
    if (amount<60){
        amountad = parseInt(amount)-3;
    } else {
        amountad = parseInt(amount)-(.05*parseInt(amount))
    }
    const balance = req.user.balance;
    const id = req.params.id;

    if ( amount > req.user.balance && !choice ) {
        req.flash(
            'error_msg',
            "You haven't selected any answer and you need to recharge first"
        );
        res.redirect("/error");
    } else if ( amount > balance ) {
        req.flash(
            'error_msg',
            'You need to recharge first'
        );
        res.redirect("/error");
    } else if ( !choice ) {
        req.flash(
            'error_msg',
            "You haven't selected any answer"
        );
        res.redirect("/error");
    } else {
        if (choice!=wow ) {
            amu = parseInt(balance) - parseInt(amount);
            statuss = "LOST";
            req.flash(
                'error_msg',
                'LOSE THE GAME'
            );
        } else {
            amu = parseInt(balance) + parseInt(amountad);
            statuss = "WON";
            req.flash(
                'success_msg',
                'WON THE GAME'
            );
        }
    
        const game1 = `You ${statuss} ₹${amountad} in LeftRight on ${today}`;
        
        User.findByIdAndUpdate(
            { _id: id },
            { $push: { game1 }, balance: amu},
            function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                   console.log("success")
                }
            }
        );
        res.redirect("/success");
    }
}

exports.game2 = (req, res) => {
    var { amount, choice, wow, today } = req.body; 
    if (amount<60){
        amountad = parseInt(amount)-3;
    } else {
        amountad = parseInt(amount)-(.05*parseInt(amount))
    }
    const balance = req.user.balance;
    const id = req.params.id;

    if ( amount > req.user.balance && !choice ) {
        req.flash(
            'error_msg',
            "You haven't selected any answer and you need to recharge first"
        );
        res.redirect("/error");
    } else if ( amount > balance ) {
        req.flash(
            'error_msg',
            'You need to recharge first'
        );
        res.redirect("/error");
    } else if ( !choice ) {
        req.flash(
            'error_msg',
            "You haven't selected any answer"
        );
        res.redirect("/error");
    } else {
        if (choice!=wow ) {
            amu = parseInt(balance) - parseInt(amount);
            statuss = "LOST";
            req.flash(
                'error_msg',
                'LOSE THE GAME'
            );
        } else {
            amu = parseInt(balance) + parseInt(amountad);
            statuss = "WON";
            req.flash(
                'success_msg',
                'WON THE GAME'
            );
        }
    
        const game2 = `You ${statuss} ₹${amountad} in Andar Bahar on ${today}`;
        
        User.findByIdAndUpdate(
            { _id: id },
            { $push: { game2 }, balance: amu},
            function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("success")
                }
            }
        );
        res.redirect("/success");
    }      
}           

exports.game3 = (req, res) => {
    var { amount, choice, wow, today } = req.body; 
    if (amount<60){
        amountad = parseInt(amount)-3;
    } else {
        amountad = parseInt(amount)-(.05*parseInt(amount))
    }
    const balance = req.user.balance;
    const id = req.params.id;

    if ( amount > req.user.balance && !choice ) {
        req.flash(
            'error_msg',
            "You haven't selected any answer and you need to recharge first"
        );
        res.redirect("/error");
    } else if ( amount > balance ) {
        req.flash(
            'error_msg',
            'You need to recharge first'
        );
        res.redirect("/error");
    } else if ( !choice ) {
        req.flash(
            'error_msg',
            "You haven't selected any answer"
        );
        res.redirect("/error");
    } else {
        if (choice!=wow ) {
            amu = parseInt(balance) - parseInt(amount);
            statuss = "LOST";
            req.flash(
                'error_msg',
                'LOSE THE GAME'
            );
        } else {
            amu = parseInt(balance) + parseInt(amountad);
            statuss = "WON";
            req.flash(
                'success_msg',
                'WON THE GAME'
            );
        }
    
        const game3 = `You ${statuss} ₹${amountad} in Dice on ${today}`;
        
        User.findByIdAndUpdate(
            { _id: id },
            { $push: { game3 }, balance: amu},
            function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("success")
                }
            }
        );
        res.redirect("/success");
    }      
}

exports.game4 = (req, res) => {
    var { amount, choice, wow, numi, today } = req.body; 
    if (amount<60){
        amountad = parseInt(amount)-3;
    } else {
        amountad = parseInt(amount)-(.05*parseInt(amount))
    }
    const balance = req.user.balance;
    const id = req.params.id;

    if ( amount > req.user.balance && !choice ) {
        req.flash(
            'error_msg',
            "You haven't selected any answer and you need to recharge first"
        );
        res.redirect("/error");
    } else if ( amount > balance) {
        req.flash(
            'error_msg',
            'You need to recharge first'
        );
        res.redirect("/error");
    } else if (!choice) {
        req.flash(
            'error_msg',
            "You haven't selected any answer"
        );
        res.redirect("/error");
    } else {
        if (choice==wow) {
            if (wow==numi) {
                if (wow==numi==2) {
                    amu = parseInt(balance) + (2*parseInt(amountad));
                    statuss = "WON";
                    req.flash(
                        'success_msg',
                        'WON THE GAME - JACKPOT'
                    );
                } else {
                    amu = parseInt(balance) + parseInt(amountad);
                    statuss = "WON";
                    req.flash(
                        'success_msg',
                        'WON THE GAME'
                    );
                }
            } else {
                if (amount<60){
                    amu = parseInt(balance)-3;
                } else {
                    amu = parseInt(balance)-(.05*parseInt(amount));
                }
                statuss = "NIETHER WON NOR LOST";
                req.flash(
                    'error_msg',
                    'NIETHER WON NOR LOST'
                );
            }
        } else {
            amu = parseInt(balance) - parseInt(amount);
            statuss = "LOST";
            req.flash(
                'error_msg',
                'LOSE THE GAME'
            );
        }
        const game4 = `You ${statuss} ₹${amountad} in Fast Parity on ${today}`;
        
        User.findByIdAndUpdate(
            { _id: id },
            { $push: { game4 }, balance: amu},
            function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("success")
                }
            }
        );
        res.redirect("/success");
    }
}

exports.order1 = (req, res) => {
    params = {
        amount: req.body.amt*100,
        currency: "INR",
        receipt: "TanSen@001",
        payment_capture: '1'
    }
    amount = params.amount/100
    if(amount<30) {
        req.flash(
            'error_msg',
            "CAN'T RECHARGE LESS THAN ₹30"
        );
        res.redirect("/error");
    } else {
        instance.orders
        .create(params)
        .then((data) => {
            res.render("r2",{sub: data, key: process.env.KEY_ID})
        })
        .catch((error) => {
            req.flash(
                'error_msg',
                'AN UNEXPECTED ERROR OCCURED'
            );
            res.redirect("/error");
        });
    }
}

exports.verify1 = (req, res) => {
    const amount = req.body.amount;

    if (amount>=1000){
        totalbal = parseInt(amount*1.1)+parseInt(req.user.balance);
    } else {
        totalbal = parseInt(amount)+parseInt(req.user.balance);
    }

    const id = req.user._id;
    body = req.body.order_id + "|" + req.body.order_pay_id;

    var expectedSignature = crypto
        .createHmac("sha256", process.env.KEY_SECRET)
        .update(body.toString())
        .digest("hex");
    
    const today = new Date();
    const recharge = `You Recharged ${amount} on ${today}`;
    if (expectedSignature === req.body.order_sig_id) {
        User.findByIdAndUpdate(
            { _id: id }, 
            { $push: { recharge }, balance: totalbal },
            function (err, result) {
                if (err) {
                    req.flash(
                        'error_msg',
                        'AN UNEXPECTED ERROR OCCURED'
                    );
                    res.redirect("/error");
                } else {
                    req.flash(
                        'success_msg',
                        'RECHARGE SUCCESSFUL'
                    );
                    res.redirect("/error");
                }
            }
        );
    } else {
        req.flash(
            'error_msg',
            'AN UNEXPECTED ERROR OCCURED'
        );
        res.redirect("/error");
    }
}

exports.contact3 = (req, res) => {
    const id = req.user._id;
    const name = req.body.name;
    const whtnum = req.body.whtnum;
    const upiad = req.body.upiad;
    const cupiad = req.body.cupiad;

    if (!name || !whtnum || !upiad || !cupiad) {
        req.flash(
            'error_msg',
            'PLEASE ENTER ALL THE FIELDS!!'
        );
        res.redirect("/error");
    } else {

        if (upiad===cupiad) {
            User.findByIdAndUpdate(
                { _id: id }, 
                { 
                    whatsapp: whtnum,
                    upiaddress: upiad,
                    withdrawname: name
                },
                function (err, result) {
                    if (err) {
                        req.flash(
                            'error_msg',
                            'AN UNEXPECTED ERROR OCCURED'
                        );
                        res.redirect("/error");
                    } else {
                        req.flash(
                            'success_msg',
                            'UPI SAVED'
                        );
                        res.redirect("/error");
                    }
                }
            );
        } else {
            req.flash(
                'error_msg',
                "UPI address doesn't match!!"
            );
            res.redirect("/error");
        }
    }
}

exports.contact4 = (req, res) => {

    const id = req.user._id;
    const balance = req.user.balance;
    const email = req.user.email;
    const amount = req.body.amount;
    const name = req.user.withdrawname;
    const upi = req.user.upiaddress;
    const whtnum = req.user.whatsapp;

    const stuff = `
    <p>ID: ${id}</p>
    <p>Email: ${email}</p>
    <p>Name: ${name}</p>
    <p>Amount: ${amount}</p>
    <p>UPI: ${upi}</p>
    <p>Number: ${whtnum}</p>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "tansengames7@gmail.com",  
            pass: "Tansen2021"  
        },
    });
    
    const mailOptions = {
        from: "tansengames7@gmail.com",
        to: "Dv7156902@gmail.com", 
        subject: "Withdraw Request: TanSen",
        generateTextFromHTML: true,
        html: stuff, 
    };

    if (!name || !whtnum || !upi) {
        req.flash(
            'error_msg',
            'UPDATE YOUR UPI DETAILS FIRST!!'
        );
        res.redirect("/error");
    } else if (amount> balance) {
        req.flash(
            'error_msg',
            "You can't withdraw more than your balance"
        );
        res.redirect('/error');
    } else if (amount<200) {
        req.flash(
            'error_msg',
            "You can't withdraw less than ₹200"
        );
        res.redirect('/error');
    } else {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                req.flash(
                    'error_msg',
                    'AN UNEXPECTED ERROR OCCURED'
                );
                res.redirect('/error');
            }
            else {
                const today = new Date();
                const withdraw = `You Withdrawed ${amount} on ${today} - Pending`;
                User.findByIdAndUpdate(
                    { _id: id }, 
                    { $push: { withdraw }},
                    function (err, result) {
                        if (err) {
                            console.log("error")
                        } else {
                            console.log("success")
                        }
                    }
                );
                console.log('Mail sent : %s', info.response);
                req.flash(
                    'success_msg',
                    'Withdraw Request Successful'
                );
                res.redirect('/error');
            }
        })
    }
}

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
}

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
}

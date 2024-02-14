"use client";

import { APP_ROUTES } from "@/constants";
import clsx from "clsx";
import { useFormik } from "formik";
import React from "react";
import { AiFillGithub, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import * as yup from "yup";
import { styles } from "../styles";

type Props = {
    setRoute: (route: string) => void;
};

const schema = yup.object().shape({
    email: yup.string().email("Invalid email!").required("Please enter your email!"),
    password: yup.string().required("Please enter your password!").min(6),
});

const Login: React.FC<Props> = ({ setRoute }) => {
    const [show, setShow] = React.useState(false);

    const { errors, touched, values, handleChange, handleSubmit } = useFormik({
        initialValues: { email: "", password: "" },
        validationSchema: schema,
        onSubmit: async ({ email, password }) => {
            console.log({ email, password });
        },
    });

    return (
        <div className="w-full">
            <h1 className={styles.title}>Login with E-Learning</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email" className={styles.label}>
                    Enter your Email
                </label>
                <input
                    type="email"
                    name=""
                    id="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="loginmail@gmail.com"
                    className={clsx(
                        styles.input,
                        "rounded",
                        errors.email && touched.email && styles.error
                    )}
                />
                {errors.email && touched.email && (
                    <span className="text-red-500 pt-2 block">{errors.email}</span>
                )}
                <div className="w-full mt-5 relative mb-1">
                    <label htmlFor="password" className={styles.label}>
                        Enter your Password
                    </label>
                    <input
                        type={show ? "text" : "password"}
                        name="password"
                        id="password"
                        value={values.password}
                        onChange={handleChange}
                        placeholder="password!@%"
                        className={clsx(
                            styles.input,
                            errors.password && touched.password && styles.error
                        )}
                    />
                    {!show ? (
                        <AiOutlineEyeInvisible
                            className="absolute bottom-3 right-2 z-1 cursor-pointer"
                            size={20}
                            onClick={() => setShow(true)}
                        />
                    ) : (
                        <AiOutlineEye
                            className="absolute bottom-3 right-2 z-1 cursor-pointer"
                            size={20}
                            onClick={() => setShow(false)}
                        />
                    )}
                    {errors.password && touched.password && (
                        <span className="text-red-500 pt-2 block">{errors.password}</span>
                    )}
                </div>
                <div className="w-full mt-5">
                    <input type="submit" value="Login" className={styles.button} />
                </div>
                <br />
                <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
                    Or join with
                </h5>
                <div className="flex items-center justify-center my-3">
                    <FcGoogle size={30} className="cursor-pointer mr-2" />
                    <AiFillGithub size={30} className="cursor-pointer ml-2" />
                </div>
                <h5>
                    Not have any accounts?{" "}
                    <span
                        className="text-[#2190ff] pl-1 cursor-pointer"
                        onClick={() => setRoute(APP_ROUTES.SIGN_UP)}
                    >
                        Sign Up
                    </span>
                </h5>
            </form>
        </div>
    );
};

export default Login;

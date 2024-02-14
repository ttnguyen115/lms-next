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
    name: yup.string().required("Please enter your name!"),
    email: yup.string().email("Invalid email!").required("Please enter your email!"),
    password: yup.string().required("Please enter your password!").min(6),
});

const SignUp: React.FC<Props> = ({ setRoute }) => {
    const [show, setShow] = React.useState(false);

    const { errors, touched, values, handleChange, handleSubmit } = useFormik({
        initialValues: { name: "", email: "", password: "" },
        validationSchema: schema,
        onSubmit: async ({ email, password }) => {
            setRoute(APP_ROUTES.VERIFICATION);
        },
    });

    return (
        <div className="w-full">
            <h1 className={styles.title}>Join to E-Learning</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className={styles.label}>
                        Enter your Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Mike"
                        className={clsx(styles.input, errors.name && touched.name && styles.error)}
                    />
                    {errors.name && touched.name && (
                        <span className="text-red-500 pt-2 block">{errors.name}</span>
                    )}
                </div>
                <div>
                    <label htmlFor="email" className={styles.label}>
                        Enter your Email
                    </label>
                    <input
                        type="email"
                        name=""
                        id="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="SignUpmail@gmail.com"
                        className={clsx(
                            styles.input,
                            errors.email && touched.email && styles.error
                        )}
                    />
                    {errors.email && touched.email && (
                        <span className="text-red-500 pt-2 block">{errors.email}</span>
                    )}
                </div>
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
                    <input type="submit" value="Sign Up" className={styles.button} />
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
                    Already have an account?{" "}
                    <span
                        className="text-[#2190ff] pl-1 cursor-pointer"
                        onClick={() => setRoute(APP_ROUTES.LOGIN)}
                    >
                        Log In
                    </span>
                </h5>
            </form>
        </div>
    );
};

export default SignUp;

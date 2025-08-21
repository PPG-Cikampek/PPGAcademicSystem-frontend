import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import id from "date-fns/locale/id";

import { Icon } from "@iconify-icon/react/dist/iconify.js";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("id", id);
setDefaultLocale("id");

const DynamicForm = ({
    logo,
    title,
    subtitle,
    fields = [],
    onSubmit,
    button,
    customDescription,
    labels = true,
    footer = true,
    helpButton,
    className,
}) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        trigger,
    } = useForm();
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (Array.isArray(fields)) {
            fields.forEach((field) => {
                if (field.value) {
                    setValue(field.name, field.value);
                    trigger(field.name);
                }
            });
        }
    }, [fields, setValue, trigger]);

    const onFormSubmit = (data) => {
        // console.log(data);
        if (onSubmit) onSubmit(data);
    };

    const currentYear = new Date().getFullYear();

    return (
        <div
            className={`card-basic rounded-md items-stretch flex-col m-2 ${className}`}
        >
            {/* Header */}
            <div
                className={`flex flex-col p-2 justify-center items-center ${
                    (logo && "mt-6") || ""
                }`}
            >
                {logo && (
                    <img
                        src={logo}
                        alt="logo"
                        className="size-24 self-center"
                    />
                )}

                {title && (
                    <h2 className="text-2xl mt-4 font-medium text-center">
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <h3 className="text-lg mt-1 font-normal text-center">
                        {subtitle}
                    </h3>
                )}
                {customDescription && (
                    <h4 className="mt-1 font-normal text-center">
                        {customDescription}
                    </h4>
                )}
            </div>
            <form onSubmit={handleSubmit(onFormSubmit)} className="">
                {Array.isArray(fields) &&
                    fields.map((field) => (
                        <div key={field.name} className="mt-6 w-full">
                            {labels && field.label && (
                                <label className="block text-gray-700 pb-1">
                                    {field.label}
                                </label>
                            )}
                            {field.type === "textarea" ? (
                                <textarea
                                    defaultValue={field.value || ""}
                                    {...register(field.name, {
                                        required: field.required,
                                    })}
                                    disabled={field.disabled}
                                    rows={field.textAreaRows}
                                    className={`w-full p-2 mb-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 ${
                                        field.disabled ? "bg-gray-200" : ""
                                    }`}
                                />
                            ) : field.type === "checkbox" ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        defaultChecked={field.value || false}
                                        {...register(field.name)}
                                        disabled={field.disabled}
                                        className={`rounded-md border-gray-300 shadow-xs focus:ring-2 focus:ring-secondary ${
                                            field.disabled
                                                ? "bg-gray-200 cursor-not-allowed"
                                                : ""
                                        }`}
                                    />
                                    <span>{field.label}</span>
                                </div>
                            ) : field.type === "select" ? (
                                <select
                                    defaultValue={field.value || ""}
                                    {...register(field.name, {
                                        required: field.required,
                                    })}
                                    disabled={field.disabled}
                                    className={`w-full p-2 border rounded-md shadow-xs hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 ${
                                        field.disabled ? "bg-gray-200" : ""
                                    }`}
                                >
                                    {field.options.map((option, index) => (
                                        <option
                                            key={index}
                                            value={option.value}
                                            disabled={option.disabled}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === "year" ? (
                                <input
                                    type="number"
                                    defaultValue={field.value || ""}
                                    placeholder={field.placeholder || "YYYY"}
                                    {...register(field.name, {
                                        required: field.required,
                                        validate: (value) =>
                                            (value >= 2018 &&
                                                value <= currentYear + 1) ||
                                            "Tahun tidak valid!",
                                    })}
                                    disabled={field.disabled}
                                    min="1900"
                                    max={currentYear + 1}
                                    step="1"
                                    className={`w-full p-2 mb-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 ${
                                        field.disabled
                                            ? "bg-gray-200 cursor-not-allowed"
                                            : ""
                                    }`}
                                />
                            ) : field.type === "phone" ? (
                                <div className="relative flex items-center">
                                    <span className="absolute left-0 px-2 text-gray-500 border-r border-gray-300">
                                        +62
                                    </span>
                                    <input
                                        type="tel"
                                        defaultValue={field.value || ""}
                                        placeholder={
                                            field.placeholder || "8123456789"
                                        }
                                        {...register(field.name, {
                                            required: field.required,
                                            pattern: {
                                                value: /^8[1-9][0-9]{6,9}$/,
                                                message:
                                                    "Nomor tidak valid! (contoh valid: 8123456789)",
                                            },
                                        })}
                                        disabled={field.disabled}
                                        className={`w-full pl-12 p-2 mb-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 ${
                                            field.disabled
                                                ? "bg-gray-200 cursor-not-allowed"
                                                : ""
                                        }`}
                                    />
                                </div>
                            ) : field.type === "radio" ? (
                                <div className="flex gap-4">
                                    {field.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2"
                                        >
                                            <input
                                                type="radio"
                                                value={option.value}
                                                defaultChecked={
                                                    field.value === option.value
                                                }
                                                {...register(field.name, {
                                                    required: field.required,
                                                })}
                                                disabled={
                                                    field.disabled ||
                                                    option.disabled
                                                }
                                                className={`border-gray-300 shadow-xs focus:ring-2 focus:ring-primary 
                                            ${
                                                field.disabled
                                                    ? "bg-gray-200 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            />
                                            <label>{option.label}</label>
                                        </div>
                                    ))}
                                </div>
                            ) : field.type === "number" ? (
                                <input
                                    type="number"
                                    defaultValue={field.value || ""}
                                    placeholder={field.placeholder || ""}
                                    min={field.min}
                                    max={field.max}
                                    step={field.step || 1}
                                    {...register(field.name, {
                                        required: field.required,
                                        ...(field.min && {
                                            min: {
                                                value: field.min,
                                                message: `Minimum value is ${field.min}`,
                                            },
                                        }),
                                        ...(field.max && {
                                            max: {
                                                value: field.max,
                                                message: `Maximum value is ${field.max}`,
                                            },
                                        }),
                                    })}
                                    disabled={field.disabled}
                                    className={`w-full p-2 mb-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary 
                                focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 
                                ${
                                    field.disabled
                                        ? "bg-gray-200 cursor-not-allowed"
                                        : ""
                                }`}
                                />
                            ) : field.type === "date" ? (
                                <Controller
                                    name={field.name}
                                    control={control}
                                    defaultValue={field.value || null}
                                    render={({
                                        field: { onChange, value },
                                    }) => (
                                        <DatePicker
                                            selected={value}
                                            onChange={onChange}
                                            className="w-full p-2 border rounded-md shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300"
                                            dateFormat="dd/MM/yyyy"
                                            wrapperClassName="w-full"
                                            showYearDropdown
                                            showMonthDropdown
                                        />
                                    )}
                                />
                            ) : field.type === "multi-input" ? (
                                <Controller
                                    name={field.name}
                                    control={control}
                                    defaultValue={field.value || [""]}
                                    render={({
                                        field: { onChange, value = [""] },
                                    }) => (
                                        <div className="space-y-2">
                                            {value.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-2"
                                                >
                                                    {field.inputType ===
                                                    "textarea" ? (
                                                        <textarea
                                                            value={item}
                                                            rows={
                                                                field.textAreaRows ||
                                                                2
                                                            }
                                                            onChange={(e) => {
                                                                const newValues =
                                                                    [...value];
                                                                newValues[
                                                                    index
                                                                ] =
                                                                    e.target.value;
                                                                onChange(
                                                                    newValues
                                                                );
                                                            }}
                                                            placeholder={
                                                                field.placeholder ||
                                                                ""
                                                            }
                                                            className="w-full p-2 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary 
                                                            focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300"
                                                        />
                                                    ) : (
                                                        <input
                                                            type={
                                                                field.inputType ||
                                                                "text"
                                                            }
                                                            value={item}
                                                            onChange={(e) => {
                                                                const newValues =
                                                                    [...value];
                                                                newValues[
                                                                    index
                                                                ] =
                                                                    field.inputType ===
                                                                    "number"
                                                                        ? e
                                                                              .target
                                                                              .value ===
                                                                          ""
                                                                            ? ""
                                                                            : Number(
                                                                                  e
                                                                                      .target
                                                                                      .value
                                                                              )
                                                                        : e
                                                                              .target
                                                                              .value;
                                                                onChange(
                                                                    newValues
                                                                );
                                                            }}
                                                            min={
                                                                field.inputType ===
                                                                "number"
                                                                    ? field.min ||
                                                                      0
                                                                    : undefined
                                                            }
                                                            max={
                                                                field.inputType ===
                                                                "number"
                                                                    ? field.max
                                                                    : undefined
                                                            }
                                                            step={
                                                                field.inputType ===
                                                                "number"
                                                                    ? field.step ||
                                                                      1
                                                                    : undefined
                                                            }
                                                            placeholder={
                                                                field.placeholder ||
                                                                ""
                                                            }
                                                            className="w-full p-2 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary 
                                                            focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300"
                                                        />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newValues =
                                                                value.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index
                                                                );
                                                            onChange(
                                                                newValues.length
                                                                    ? newValues
                                                                    : [""]
                                                            );
                                                        }}
                                                        className="px-2 pt-1 text-danger hover:bg-danger/10 rounded-full transition-colors"
                                                    >
                                                        <Icon
                                                            icon="mdi:delete"
                                                            width="20"
                                                            height="20"
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onChange([...value, ""])
                                                }
                                                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                                            >
                                                <Icon
                                                    icon="mdi:plus"
                                                    width="20"
                                                    height="20"
                                                />
                                                Tambah
                                            </button>
                                        </div>
                                    )}
                                />
                            ) : (
                                <div className="relative">
                                    <input
                                        type={
                                            field.type === "password" &&
                                            showPassword
                                                ? "text"
                                                : field.type
                                        }
                                        defaultValue={field.value || ""}
                                        placeholder={field.placeholder || ""}
                                        {...register(field.name, {
                                            required: field.required,
                                        })}
                                        disabled={field.disabled}
                                        className={`w-full p-2 mb-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 ${
                                            field.disabled
                                                ? "bg-gray-200 cursor-not-allowed"
                                                : ""
                                        }`}
                                    />
                                    {field.type === "password" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                                        >
                                            {!showPassword ? (
                                                <Icon
                                                    icon="eva:eye-outline"
                                                    width="24"
                                                    height="24"
                                                    className="text-gray-400 hover:text-black transition-all duration-200"
                                                />
                                            ) : (
                                                <Icon
                                                    icon="eva:eye-off-outline"
                                                    width="24"
                                                    height="24"
                                                    className="text-gray-400 hover:text-black transition-all duration-200"
                                                />
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                            {errors[field.name] && (
                                <span className="text-danger text-sm">
                                    {errors[field.name].message ||
                                        `${field.label} tidak boleh kosong!`}
                                </span>
                            )}
                        </div>
                    ))}
                {helpButton}
                {button}
                {footer && (
                    <div className="border-t-[0.5px] text-xs font-light text-center p-4 mt-6">
                        <p>©PPG Cikampek All Right Reserved {currentYear}</p>
                        {/* <p>© <a href="http://localhost:5173/" className='underline active:text-primary'>PPG Cikampek</a> All Right Reserved {currentYear}</p> */}
                    </div>
                )}
            </form>
        </div>
    );
};

export default DynamicForm;

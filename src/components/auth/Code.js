import React from 'react'
import { TextField } from '@mui/material'
import { useFormikContext } from 'formik'

export const Code = (props) => {
    const { values, handleChange } = useFormikContext()

    return (
        <TextField
            name="code"
            type="text"
            label="Code"
            value={values.code}
            onChange={handleChange}
            placeholder="Confirmation code"
        />
    )
}

import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';

const categories = {
    ANNUAL_LEAVE: "Annual Leave",
    PUBLIC_HOLIDAYS: "Public Holidays",
    SICK_LEAVE: "Sick Leave",
    PATERNITY_LEAVE: "Patternity Leave",
    ADOPTIVE_LEAVE: "Adoptive Leave",
    CARERS_LEAVE: "Carer's Leave",
    PARENTAL_LEAVE: "Parental Leave"
}

function CustomTable({ headers, rows, readonly, emmiter, selectionSetter }) {

    const rowCount = rows.length
    const [numSelected, setNumSelected] = useState(0)
    const [selected, setSelected] = useState([])

    function isSelected(id) {
        return selected.indexOf(id) !== -1
    }

    function onSelectAllClick(event) {
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n.id)
            setSelected(newSelecteds)
            setNumSelected(newSelecteds.length)

            selectionSetter(newSelecteds)

            return;
        }

        setSelected([])
        setNumSelected(0)

        selectionSetter([])
    }

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id)
        let newSelected = []

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id)
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1))
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1))
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            )
        }

        setSelected(newSelected);
        setNumSelected(newSelected.length)

        selectionSetter(newSelected)
    }

    // function ApproveVacations(){
    //     emmiter.emit("approveVacations", selected)
    // }

    // function RejectVacations() {
    //     emmiter.emit("rejectVacations", selected)
    // }

    // function DeleteVacations() {
    //     emmiter.emit("deleteVacations", selected)
    // }

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {!readonly &&
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={numSelected > 0 && numSelected < rowCount}
                                    checked={rowCount > 0 && numSelected === rowCount}
                                    onChange={onSelectAllClick}
                                    inputProps={{
                                        'aria-label': 'select all vacation requests',
                                    }}
                                />
                            </TableCell>
                        }
                        {headers.map((item, index) => {
                            if (index === 0) {
                                return (
                                    <TableCell key={index + 1}>{item}</TableCell>
                                )
                            }
                            else {
                                return (
                                    <TableCell align="center" key={index + 1}>{item}</TableCell>
                                )
                            }
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => {
                        const isItemSelected = isSelected(row.id);
                        const labelId = `custom-table-checkbox-${index}`;

                        return (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                hover
                                onClick={(event) => handleClick(event, row.id)}
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                selected={isItemSelected}
                            >
                                {!readonly &&
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isItemSelected}
                                            inputProps={{
                                                'aria-labelledby': labelId,
                                            }}
                                        />
                                    </TableCell>
                                }
                                <TableCell component="th" scope="row">
                                    {row.description}
                                </TableCell>
                                <TableCell align="center">{`${row.startDate}`.replace('Z', '')}</TableCell>
                                <TableCell align="center">{`${row.endDate}`.replace('Z', '')}</TableCell>
                                <TableCell align="center">{categories[row.category]}</TableCell>
                                <TableCell align="center">{row.owner}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default CustomTable

import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import * as global from "./globals" ;
import { IUniversityClass, dataTable } from "./types/api_types";
import { RowingSharp } from "@mui/icons-material";
import { SelectChangeEvent } from '@mui/material/Select';
import { calcAllFinalGrade } from "./utils/calculate_grade";
import { rowData } from './components/GradeTable';

function App() {
  // You will need to use more of these!
  const [currClassId, setCurrClassId] = useState<string>("");   // set as current classId selected by select component
  const [classList, setClassList] = useState<IUniversityClass[]>([]); // get all classId 
  const [rowsPerPage, setRowsPerPage] = React.useState(10); // set how many rows per page
  const [page, setPage] = React.useState(0);  // set page
  const [table, setTable] = useState<Array<any>>([]); // table state

  let rows : Array<any> = [];  // save grid table rows

  // get all classes' id in this semester
  const fetchlistBySemester = async () => {
    const res = await fetch("https://dscs519-assessment.azurewebsites.net/api/class/listBySemester/fall2022?buid=U81066856",{
      method: "GET",
      headers: global.GET_DEFAULT_HEADERS(),
    });
    const classes = await res.json();
    console.log(classes);
    setClassList(classes);
  }

  // call fetch classes function
  useState(() => {
    fetchlistBySemester();
  })

  // handle change of class id and request/update all data of grid table
  const handleChangeClass = async (event: SelectChangeEvent) => {
    const cTitle = event.target.value.toString();
    setCurrClassId(cTitle);
    let cID = ""
    for(let i=0; i < classList.length; i++){
      if(classList[i].title == cTitle){
        cID = classList[i].classId;
      }
    }
    // get all student
    const resStudent = await fetch("https://dscs519-assessment.azurewebsites.net/api/class/listStudents/" + cID + "?buid=" + global.MY_BU_ID,{
        method: "GET",
        headers: global.GET_DEFAULT_HEADERS(),
      });
    const cStudent = await resStudent.json();

    let cStudentDetail: Array<any> = [];
    let cStudentGrades: Array<any> = [];
    for(let i = 0; i < cStudent.length; i++){
      // get all student name
      const resStudentName = await fetch("https://dscs519-assessment.azurewebsites.net/api/student/GetById/" + cStudent[i] + "?buid=" + global.MY_BU_ID,{
        method: "GET",
        headers: global.GET_DEFAULT_HEADERS(),
      });
      const tmp = await resStudentName.json()
      cStudentDetail.push(tmp);

      // get grades
      const resStudentGrade = await fetch("https://dscs519-assessment.azurewebsites.net/api/student/listGrades/" + cStudent[i] + "/" + cID + "/?buid=" + global.MY_BU_ID,
      {method: "GET",
      headers: global.GET_DEFAULT_HEADERS(),});
      cStudentGrades.push(await resStudentGrade.json());
    }
    // console.log(cStudentGrades);

    // get assignments weights
    const resAssignments = await fetch("https://dscs519-assessment.azurewebsites.net/api/class/listAssignments/" + cID + "?buid=" + global.MY_BU_ID,
      {method: "GET",
      headers: global.GET_DEFAULT_HEADERS()});

    const assignmentsWeight = await resAssignments.json()
    let weightDict: { [key: string]: number; } = {};

    for(let i = 0; i < assignmentsWeight.length; i++){
      weightDict[assignmentsWeight[i]['assignmentId']] = assignmentsWeight[i]['weight'];
    }

    let grades = await calcAllFinalGrade(cStudentGrades, weightDict);

    // calculate data and generate row's data
    for(let i = 0; i < grades.length; i++){
      rows.push(rowData(cStudent[i],cStudentDetail[i][0]['name'],cID,cTitle,"fall2022",grades[i]));
    }

    setTable(rows);
  };
  

  // handle data grid change page
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  // handle data grid change rows per page
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  


  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        <Grid xs={12} container alignItems="center" justifyContent="center">
          <Typography variant="h2" gutterBottom>
            Spark Assessment
          </Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            Select a class
          </Typography>
          <div style={{ width: "100%" }}>
            <Select fullWidth={true} label="Class" onChange={handleChangeClass}>
              {/* You'll need to place some code here to generate the list of items in the selection */
              classList.map(ls => (
                <MenuItem key={ls.title} value={ls.title}>
                  {ls.title}
                </MenuItem>
              ))
              }
            </Select>
          </div>
        </Grid>
        <Grid xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Final Grades
          </Typography>
          <TableContainer>
            <Table sx={{minWidth:650}} arail-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell align="left">Student Name</TableCell>
                  <TableCell align="left">Class ID</TableCell>
                  <TableCell align="left">Class Name</TableCell>
                  <TableCell align="left">Semester</TableCell>
                  <TableCell align="left">Final Grade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table.map((row) => (
                  <TableRow
                    key = {row.studentId}
                    sx ={{ '&:last-child td, &:last-child th': { border:0}}}>
                      <TableCell component="th" scope="row">
                        {row.studentId}
                      </TableCell>
                      <TableCell align="left">{row.studentName}</TableCell>
                      <TableCell align="left">{row.classId}</TableCell>
                      <TableCell align="left">{row.className}</TableCell>
                      <TableCell align="left">{row.semester}</TableCell>
                      <TableCell align="left">{row.finalGrade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination rowsPerPageOptions={[5, 25, 100]}
            component="div"
            count={table.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

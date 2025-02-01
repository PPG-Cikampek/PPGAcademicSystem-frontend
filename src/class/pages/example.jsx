// npm uninstall react-chartjs-2 chart.js react-spring
{
    "id": "academicYearId00001",
    "year": "2024/2025",
    "semester": {
        "id": "semesterId0001",
        "name": "Ganjil",
        "branches": {
            "id": "branchId0001",
            "name": "Teluk Jambe Timur",
            "address": "Jl. Raya Cikampek No.123",
            "teachingGroups": {
                "id": "teachingGroupId0001",
                "name": "Mekar Raya",
                "address": "Galuh Mas RT00/00 Cikampek Timur Raya",
                "classes": {
                    "id": "classId0001",
                    "name": "Kelas 1",
                    "teacher": {},
                    "students": {},
                    "attendance": {
                        "id": "attendanceId0001",
                        "studentId": "studentId00001",
                        "date": "01 Nov 2024 16:00:00",
                        "status": "Hadir",
                        "attributes": true
                    }
                }
            }
        }
    }
},
{
    "attendance": {
        "id": "attendanceId0002",
        "timestamp": "12 Nov 2024 15:50:00",
        "studentId": "studentId0001",
        "status": "Hadir",
        "attributes": true,
        "classId": "classId0001"
    },
    {
        "id": "attendanceId0003",
        "timestamp": "12 Nov 2024 15:50:00",
        "studentId": "studentId0002",
        "status": "Sakit",
        "attributes": true,
        "classId": "classId0001"
    },
    {
        "id": "attendanceId0004",
        "timestamp": "12 Nov 2024 15:50:00",
        "studentId": "studentId0003",
        "status": "Telat",
        "attributes": false,
        "classId": "classId0001"
    },
},
{
    "teacher": {
        "name": "",
        "nid": "",
        "phone": "",
        "position": "",
        "email": "",
        "dateOfBirth": "",
        "positionStartDate": "",
        "positionEndDate": "",
        "classIds": [
            "classId0001",
            "classId0002"
        ],
        "branchId": "",
        "teachingGroupId": "",
    }
}
// Student Attendance Report
{
    "academicYear": "2024/2025",
    "semesters": [
        {
            "semester": "Ganjil",
            "branch"
        },
        {
            "semester": "Genap"
        }
    ]
},
{ 
    regionId: "regionId0001",
    regionName: "Dummy North Region",
    schools: {
        schoolId: "schoolId0001",
        schoolName: "International Dummy School 1",
        attendances: {
            id: "attendanceId0002",
            timestamp: "12 Nov 2024 15:50:00",
            studentId: {
                id: "studentId0001",
                nis: "20180010",
                name: "Binazafam"
            },
            status: "Hadir",
            attributes: true,
            classId: "classId0001"
        },
        //attendanceId0003, attendanceId0004, and so on for like hundreds of them through different classes
    },
    //schoolId0002, schoolId0003, and so on for like 10 to 20 schools
},
//regionId0002, regionId003, and so on for like 5 to 10 different regions
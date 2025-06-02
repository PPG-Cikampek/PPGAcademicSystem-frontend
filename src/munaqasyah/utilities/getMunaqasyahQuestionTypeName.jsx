const getMunaqasyahQuestionTypeName = (questionType) => {
        const questionTypeMap = {
            multipleChoices: "Pilihan Ganda",
            shortAnswer: "Jawab Cermat",
            practice: "Praktik",
        };
        return questionTypeMap[questionType] || 'kosong';
    };

export default getMunaqasyahQuestionTypeName;
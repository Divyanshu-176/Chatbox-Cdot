    import React, { useState, useRef, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import './style.css'; // Ensure this file is correctly linked
import { Document, Page } from 'react-pdf';

import { marked } from "marked";
import DOMPurify from "dompurify";

import { useNavigate } from "react-router-dom";

import { pdfjs } from 'react-pdf';

{/* <i className=' cursor-pointer fs-4 bi-gear  me-3 text-dark' title=" Settings" onClick={() => { setShowVoiceSetting(!ShowVoiceSetting); }}></i> */}


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();






const Chatbox = () => {
    // const BASE_PATH = process.env.BACK_END_URL;
    const LLM_API_Base_URL = "https://stagingeservices.dot.gov.in/dotmitra"
    // const RAG_API_Base_URL = "http://127.0.0.1:9090"
    const RAG_API_Base_URL = "https://stagingeservices.dot.gov.in/dotmitra"
    const BASE_PATH = "https://stagingeservices.dot.gov.in/dotmitra"
    const FRONT_PATH = "http://localhost:3000"
    // const BASE_PATH = "https://stagingeservices.dot.gov.in/dotmitra"
    // const FRONT_PATH = "https://aieservices.dot.gov.in/"
    // console.log("BASE_PATH", BASE_PATH)
    const navigate = useNavigate();



    const sanitizeMessage = (message) => {
        const rawHtml = marked(message); // Convert Markdown to HTML
        return DOMPurify.sanitize(rawHtml); // Sanitize HTML
    };


    const [isActive, setIsActive] = useState(false);
    const [messages, setMessages] = useState([]);

    const [inputText, setInputText] = useState("");


    const inputRef = useRef();

    const isTypingRef = useRef(false); // initially not typing
    const [typingRenderToggle, setTypingRenderToggle] = useState(false);
    const messagesEndRef = useRef(null);

    const [zoomed, setzoomed] = useState(false)
    const [activebubble, setactivebubble] = useState(false)
    const [pdfs, setPdfs] = useState([]);

    const [pdfsCategory, setPdfsCategory] = useState([]);

    const [selectedPDF, setSelectedPDF] = useState("All_PDF");

    const [selectedPDFName, setSelectedPDFName] = useState("All");

    const [suggestedquestion, setsuggestedquestion] = useState([])

    const [numPages, setNumPages] = useState();
    const [pageNumber, setPageNumber] = useState(1);
    const [GotopageNumber, setGotoPageNumber] = useState(false);

    const [Select_Menu, setSelect_Menu] = useState("");
    const [Select_Services, setSelect_Services] = useState("");
    const [Select_Sub_Services, setSelect_Sub_Services] = useState("");
    const [llm_Mode, setLLM_MODE] = useState(false);
    const [llm_active, setllm_active] = useState(true);


    const [Loader, setLoader] = useState(false);
    const [ShowVoiceSetting, setShowVoiceSetting] = useState(false);

    // const BASE_PATH = process.env.REACT_APP_BASE_API_PATH;
    // console.log("BASE_PATH", BASE_PATH)
    const [searchQuery, setSearchQuery] = useState("");
    const [TabName, setTabName] = useState("");
    const [CategoryName, setCategoryName] = useState("");

    const [analisysdata, setanalisysdata] = useState("")
    const [analisysdataloader, setanalisysdataloader] = useState(false)

    const [typedText, setTypedText] = useState('');
    const fullText = "Hi, I'm DoT Mitra, how can I help?";
    const typingSpeed = 25; // Speed in ms per character

    // Suggested prompts array
    const suggestedPrompts = [
        "What is DoT?",
        "What is SACFDA?",
        "Tell me about the Act & Rules of the Telecom Act"
    ];

    // Magnify effect for header
    const handleHeaderMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    };

    const [isIframe, setIsIframe] = useState(false);
    const mobilescreen = window.innerWidth

    function onDocumentLoadSuccess({ numPages }) {
        console.log('====', numPages)
        setNumPages(numPages);
    }

    useEffect(() => {
        // Check if loaded inside an iframe
        const insideIframe = window.self !== window.top;
        setIsIframe(insideIframe);

        if (insideIframe) {
            console.warn("App is running inside an iframe");
            // setIsActive(!isActive); 
            // setzoomed(false); 
            // Optional: Break out of iframe
            // window.top.location = window.self.location;

            // OR Optional: Redirect to a warning page
            // navigate("/iframe-blocked");
        }
    }, []);




    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                setTypedText(fullText.substring(0, index + 1));
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, typingSpeed);

        return () => clearInterval(typingInterval); // Cleanup on unmount
    }, [fullText]);

    const extractFileName = useCallback((path) => {
        return path.replace('/media/pdfs/', '').replace('.pdf', '');
    }, []); // Empty dependency array since no dependencies



    const searchPdfs = () => {
        return pdfs.filter((pdf) => {
            const matchesTab = TabName ? pdf.filetype_name?.toLowerCase().includes(TabName.toLowerCase()) : true;
            const matchesCategory = CategoryName ? pdf.fileCategory_name?.toLowerCase().includes(CategoryName.toLowerCase()) : true;
            const matchesSearch = searchQuery ? pdf.filename?.toLowerCase().includes(searchQuery.toLowerCase()) : true;
            return matchesTab && matchesCategory && matchesSearch;
        });
        // return filterwithtag().filter((pdf) =>
        //     pdf.filename?.toLowerCase().includes((searchQuery).toLowerCase())
        // );
    };

    const [selectedpdf, setSelectedpdf] = useState([]);

    const toggle = (item) => {
        setSelectedpdf(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)       // remove if already selectedpdf
                : [...prev, item]                   // add if not selectedpdf
        );
    };
    // Toggle select all / deselect all
    const toggleSelectAll = () => {
        if (selectedpdf.length === searchPdfs.length) {
            setSelectedpdf(
                searchPdfs().map((pdf) => (
                    pdf.file
                ))
            )
        } else {
            setSelectedpdf([]);
        }
    };

    useEffect(() => {
        setSelectedpdf(
            searchPdfs().map((pdf) => (
                pdf.file
            ))

        )
    }, [TabName, CategoryName, searchQuery]);




    useEffect(() => {
        console.log("####_HELLO", searchPdfs().map((pdf) => (
            pdf.file.split("/").pop())))
        if (!searchPdfs || searchPdfs.length === 0) {
            console.warn("No file names provided.");
            return;
        }
        fetch(`${RAG_API_Base_URL}/getrandomquestions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file_names: searchPdfs().map((pdf) => (
                    pdf.file.split("/").pop()
                ))
            }),
        })
            .then(response => response.json())
            .then(data => setsuggestedquestion(data.suggested_questions))
            .catch(error => console.error('Error:', error));
    }, [TabName, CategoryName, searchQuery]);



    // New function to fetch random questions
    const fetchRandomQuestions = async (fileNames) => {
        if (!fileNames || fileNames.length === 0) {
            console.warn("No file names provided.");
            return;
        }
        console.log("####_fileNames", fileNames)
        fetch(`${RAG_API_Base_URL}/getrandomquestions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file_names: fileNames }),
        })
            .then(response => response.json())
            .then(data => setsuggestedquestion(data.suggested_questions))
            .catch(error => console.error('Error:', error));
    };

    // New function to fetch random questions
    const Checksnetense = async (sentence) => {
        if (!sentence || sentence.length === 0) {
            console.warn("No file names provided.");
            return null;
        }
        // 1. Build the prompt
        const prompt = `
            Check the following sentence: "${sentence}"

            Return a JSON object:
            {
            "abusive": true/false,
            "is_illegal": true/false,
            "is_unethical": true/false,
            "is_harmful": true/false,
            "explanation": "brief reason"
            }
            `;
        try {
            const response = await fetch(`${LLM_API_Base_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();
            const raw = data.response;
            const clean = raw.replace(/```json\n|```/g, "").trim();
            const result = JSON.parse(clean);

            console.log("✅ Safety Check:", result);
            return result;

        } catch (error) {
            console.error("❌ Safety check failed:", error);
            return null;
        }
    };



    // New function to fetch random questions
    const [analizeddata, setanalizeddata] = useState("")
    const Analysysdata = async (answer, qestion) => {
        console.log("answer", messages[answer].message)
        console.log("qestion", messages[qestion].message)
        setanalizeddata("")
        setanalisysdataloader(true)
        try {
            const response = await fetch(`${BASE_PATH}/ContentEvaluateAPIView/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: messages[qestion].message, answer: messages[answer].message }),
            });

            const data = await response.json();
            // setanalizeddata(data.evaluation)
            setanalisysdataloader(false)
            AnalysysdataTyping(data.evaluation)
            console.log("analized", data.evaluation)
        } catch (error) {
            console.error('Fetch error:', error);
        }

    };

    // Simulate typing effect for analysis data
    const AnalysysdataTyping = (inputText) => {
        if (!inputText || typeof inputText !== 'string') {
            console.error('Invalid evaluation text');
            return;
        }

        isTypingRef.current = true;
        let i = 0;
        let appneddata = ''
        const interval = setInterval(() => {
            if (!isTypingRef.current) {
                clearInterval(interval); // stop typing if interrupted
                isTypingRef.current = false; // done typing
                setTypingRenderToggle(prev => !prev); // Force re-render here too
                return;
            }

            if (i < inputText.length) {
                appneddata += inputText[i];
                console.log("AnalysysdataTyping", appneddata)
                setanalizeddata(appneddata)
                // setanalizeddata((prev) => [
                //   { name: 'Sam', message: (prev[0]?.message || '') + inputText[i] },
                // ]);
                i++;
            } else {

                console.log('Typing finished');
                clearInterval(interval);
                isTypingRef.current = false;
                setTypingRenderToggle(prev => !prev); // Force re-render here too
            }
        }, 1); // 50ms typing speed
    };


    let iframesrc = BASE_PATH + selectedPDF

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!selectedPDF) {
            setzoomed(false)
        }
    }, [selectedPDF]);

    const triggerGotoPage = (pageNumber) => {
        setPageNumber(pageNumber)
        setGotoPageNumber(true);
        setTimeout(() => {
            setGotoPageNumber(false);
        }, 1); // 1 millisecond
    };



    // console.log("selected", selectedpdf.map((item) => item.split('/').pop()))

    // const handleSendMessage = async (inputText) => {
    //     // if (Loader) return;
    //     if (!inputText || inputText === '') return;
    //     const usrinput = inputText
    //     setInputText("")
    //     const userMessage = { name: 'User', message: usrinput };
    //     setMessages((prev) => [...prev, userMessage]);

    //     // Step 1: Check for abuse or illegality
    //     const checkResult = await Checksnetense(inputText);

    //     if (
    //         checkResult &&
    //         (checkResult.abusive || checkResult.is_illegal || checkResult.is_unethical || checkResult.is_harmful)
    //     ) {
    //         const warningMsg = {
    //             name: 'Sam',
    //             message: `❗Your message was flagged as inappropriate or illegal. Reason: ${checkResult.explanation}`,
    //         };
    //         setMessages((prev) => [...prev, warningMsg]);
    //         return; // ❌ Stop further execution
    //     }


    //     // setIsTyping(true);
    //     setLoader(true)
    //     setsuggestedquestion([])
    //     try {
    //         const response = await fetch(`${BASE_PATH}/chat/`, {
    //             method: 'POST',
    //             body: JSON.stringify({ With_LLM: llm_active, TabName: TabName, message: usrinput, selectedmode: selectedpdf.map((item) => item.split('/').pop()) }),
    //             headers: { 'Content-Type': 'application/json' },
    //         });

    //         const data = await response.json();

    //         console.log("response", data)
    //             ;
    //         const pagenumber = extractPageNumber(data.message)
    //         if (pagenumber) {
    //             setPageNumber(pagenumber);
    //             setSelectedPDF(selectedPDF)
    //         }
    //         const formattedMessage = data.message.replace(/(answer is not available in the context)/g, "")
    //             .replace(/(https?:\/\/[^\s]+)/g, (url) => {
    //                 return `<a href="${url}?field_questions_value=${usrinput}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    //             })




    //         if (llm_Mode === true) {
    //             speak(formattedMessage.replace(/[*\-_~`]+/g, ""))
    //         }

    //         const botMessage = { name: 'Sam', message: formattedMessage };

    //         // setMessages((prev) => [...prev, botMessage]);
    //         // setIsTyping(false);
    //         setLoader(false)
    //         simulateTyping(data.message.replace(/(answer is not available in the context)/g, ""), data.relevant_patterns);
    //         // setsuggestedquestion(data.relevant_patterns)
    //     } catch (error) {
    //         // setIsTyping(false);
    //         console.error('Error:', error);
    //         const errorMessage = { name: 'Sam', message: 'Error connecting to server.' };
    //         setMessages((prev) => [...prev, errorMessage]);
    //         setLoader(false)
    //     }


    // };

    const handleSendMessage = async (inputText) => {
        // if (Loader) return;
        if (!inputText || inputText === '') return;
        setHasPrompted(true); // Hide suggested prompts after first message
        const usrinput = inputText
        setInputText("")
        const userMessage = { name: 'User', message: usrinput };
        setMessages((prev) => [...prev, userMessage]);

        // Step 1: Check for abuse or illegality
        // const checkResult = await Checksnetense(inputText);

        // if (
        //     checkResult &&
        //     (checkResult.abusive || checkResult.is_illegal || checkResult.is_unethical || checkResult.is_harmful)
        // ) {
        //     const warningMsg = {
        //         name: 'Sam',
        //         message: `❗Your message was flagged as inappropriate or illegal. Reason: ${checkResult.explanation}`,
        //     };
        //     setMessages((prev) => [...prev, warningMsg]);
        //     return; // ❌ Stop further execution
        // }

        setLoader(true)
        setsuggestedquestion([])
        try {
            const response = await fetch(`${RAG_API_Base_URL}/ask/`, {
                method: 'POST',
                body: JSON.stringify({ tabname: TabName, question: usrinput, file_names: selectedpdf.map((item) => item.split('/').pop()) }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            console.log("response", data);
            const pagenumber = extractPageNumber(data.message)
            if (pagenumber) {
                setPageNumber(pagenumber);
                setSelectedPDF(selectedPDF)
            }
            const formattedMessage = data.message.replace(/(answer is not available in the context)/g, "")
                .replace(/(https?:\/\/[^\s]+)/g, (url) => {
                    return `<a href="${url}?field_questions_value=${usrinput}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                })




            if (llm_Mode === true) {
                speak(formattedMessage.replace(/[*\-_~`]+/g, ""))
            }

            // const botMessage = { name: 'Sam', message: formattedMessage };

            // setMessages((prev) => [...prev, botMessage]);
            // setIsTyping(false);

            setLoader(false)
            simulateTyping(data.message.replace(/(answer is not available in the context)/g, ""), data.relevant_patterns);

            // setsuggestedquestion(data.relevant_patterns)
        } catch (error) {
            // setIsTyping(false);
            console.error('Error:', error);
            const errorMessage = { name: 'Sam', message: 'Error connecting to server.' };
            setMessages((prev) => [...prev, errorMessage]);
            setLoader(false)
        }


    };

    function extractPageNumber(str) {
        // Regular expression to match "Page: X" where X is a number
        const regex = /Page:\s*(\d+)/;
        // Use regex to match the page number in the string
        const match = str.match(regex);
        // If a match is found, return the page number
        if (match) {
            return parseInt(match[1], 10); // Return the page number as an integer
        }
        // If no match is found, return null or some default value
        return null;
    }


    // function renderMessageContent(msg, onPageClick, onPdfClick, suggestion) {

    //     const questionFormatted = msg.replace(/Question:\s*(\d+)/gi, (match, qNum) => {
    //         return `<span class="bg-warning text-black px-1">Question: ${qNum}</span>`;
    //     });

    //     // Split the content to handle "Page: <number>" and PDF filenames
    //     const parts = questionFormatted.split(/(Page:\s*\d+)/gi);

    //     return parts.map((part, index) => {
    //         // Handle "Page: <number>"
    //         const pageMatch = part.match(/Page:\s*(\d+)/i);

    //         // Handle PDF filenames (e.g., document.pdf)
    //         const pdfRegex = /([a-zA-Z0-9_-]+\.pdf)/gi;

    //         if (pageMatch) {
    //             const pageNum = parseInt(pageMatch[1], 10);
    //             // Example logic: Disable clicks for page numbers > 100 (or any custom condition)
    //             const isValidPage = pageNum > 0 && pageNum <= 100; // Adjust condition as needed
    //             if (part.match(pdfRegex)) { }

    //             return (
    //                 <i
    //                     key={`page-${index}`}
    //                     className={`p-1 rounded cursor-pointer mx-1 ${isValidPage ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    //                         }`}
    //                     title={`Go to page ${pageNum}`} // Tooltip for accessibility
    //                     onClick={() => {
    //                         if (isValidPage) {
    //                             onPageClick(pageNum, { source: 'renderMessageContent', suggestion });
    //                         }
    //                     }}
    //                 >
    //                     P {pageNum}
    //                 </i>
    //             );
    //         }

    //         if (part.match(pdfRegex)) {
    //             // Split the part by PDF filenames to render them separately
    //             const subParts = part.split(pdfRegex);
    //             return subParts.map((subPart, subIndex) => {
    //                 if (subPart.match(pdfRegex)) {
    //                     const data = subPart.replace("PDF", "pdf")
    //                     return (
    //                         <u
    //                             key={`pdf-${index}-${subIndex}`}
    //                             className="text-primary p-1 rounded cursor-pointer ellipsis"
    //                             onClick={() => { setSelectedPDF("/media/pdfs/" + data); setzoomed(true); }}
    //                         >
    //                             {data}
    //                         </u>
    //                     );
    //                 }
    //                 return (
    //                     <span
    //                         key={`text-${index}-${subIndex}`}
    //                         dangerouslySetInnerHTML={{ __html: sanitizeMessage(subPart) }}
    //                     />
    //                 );
    //             });
    //         }

    //         // Render non-page, non-PDF content
    //         return (
    //             <span
    //                 key={index}
    //                 dangerouslySetInnerHTML={{ __html: sanitizeMessage(part) }}
    //             />
    //         );
    //     });

    // }

    function renderMessageContent(msg, onPageClick, onPdfClick, suggestion, pagePdfMap = {}) {
        const pdfRegex = /([a-zA-Z0-9_-]+\.pdf)/gi;

        const questionFormatted = msg.replace(/Question:\s*(\d+)/gi, (match, qNum) => {
            return `<span class="bg-warning text-black px-1">Question: ${qNum}</span>`;
        });

        const parts = questionFormatted.split(/(Page:\s*\d+)/gi);

        return parts.map((part, index) => {
            const pageMatch = part.match(/Page:\s*(\d+)/i);

            // If part contains Page: <num> + filename, wrap together
            if (pageMatch) {
                const pageNum = parseInt(pageMatch[1], 10);
                const isValidPage = pageNum > 0 && pageNum <= 100;

                // Look ahead to next part to find the filename if it exists
                const nextPart = parts[index + 1] || '';
                const filenameMatch = nextPart.match(pdfRegex);
                const fileName = filenameMatch ? filenameMatch[0] : pagePdfMap[pageNum];

                return (
                    <div key={`group-${index}`} className="d-inline-block my-1 me-2">

                        <i
                            style={{
                                backgroundColor: isValidPage ? '#dce49ca1' : '#dce49ca1', // Tailwind: bg-warning or bg-gray-300
                                color: isValidPage ? '#212529' : '#6b7280',           // Tailwind: text-dark or text-gray-500
                                cursor: isValidPage ? 'pointer' : 'not-allowed'
                            }}
                            className={`p-1 rounded cursor-pointer `}
                            title={fileName ? `Go to Page ${pageNum} in ${fileName}` : `Page ${pageNum}`}
                            onClick={() => {
                                if (isValidPage && fileName) {
                                    setSelectedPDF("/media/pdfs/" + fileName);
                                    setzoomed(true);
                                    onPageClick(pageNum, { source: 'renderMessageContent', suggestion });
                                }
                            }}
                        >
                            P {pageNum}
                        </i>

                    </div>
                );
            }

            // Skip rendering filename separately if already used with page
            if (part.match(pdfRegex)) {
                return null;
            }

            // Default content rendering
            return (
                <span
                    key={`text-${index}`}
                    dangerouslySetInnerHTML={{ __html: sanitizeMessage(part) }}
                />
            );
        });
    }




    const handleSendsuggestion = async (suggestion) => {
        setHasPrompted(true); // Hide suggested prompts after suggestion click
        const userMessage = { name: 'User', message: suggestion };
        setMessages((prev) => [...prev, userMessage]);
        // setIsTyping(true);
        setLoader(true)
        setsuggestedquestion([])
        try {
            const response = await fetch(`${RAG_API_Base_URL}/ask/`, {
                method: 'POST',
                body: JSON.stringify({ tabname: TabName, question: suggestion, file_names: selectedpdf.map((item) => item.split('/').pop()) }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            // let msg = '';

            simulateTyping(data.message.replace(/(answer is not available in the context)/g, ""), data.relevant_patterns);
            const pagenumber = extractPageNumber(data.message)
            if (pagenumber) {
                console.log("page number", pagenumber)
                setPageNumber(pagenumber);
                setSelectedPDF(selectedPDF)

            }
            const formattedMessage = data.message.replace("answer is not available in the context", "")
                .replace(/(https?:\/\/[^\s]+)/g, (url) => {
                    return `<a href="${url}?field_questions_value=${suggestion}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                })



            if (llm_Mode === true) {
                speak(formattedMessage.replace(/[*\-_~`]+/g, ""))
            }


            // const ms = `<p>${data.message.replace(/(https?:\/\/[^\s]+)/g, `<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>`)} </p>`

            const botMessage = { name: 'Sam', message: formattedMessage };

            // setMessages((prev) => [...prev, botMessage]);
            // setIsTyping(false);
            console.log("response", data)
            setSelectedPDF(selectedPDF)
            // setsuggestedquestion(data.relevant_patterns)
            setLoader(false)
        } catch (error) {
            // setIsTyping(false);
            console.error('Error:', error);
            const errorMessage = { name: 'Sam', message: 'Error connecting to server.' };
            setMessages((prev) => [...prev, errorMessage]);
        }

    };


    const simulateTyping = (inputtext, suggestion) => {
        let text = inputtext
        if (!text || typeof text !== 'string') {
            console.error("Invalid message text.");
            return;
        }
        isTypingRef.current = true; // start typing
        let i = 0;
        const interval = setInterval(() => {
            if (!isTypingRef.current) {
                clearInterval(interval); // stop typing if interrupted
                isTypingRef.current = false; // done typing
                setTypingRenderToggle(prev => !prev); // Force re-render here too
                return;
            }
            if (i < text.length) {
                const currentChar = text[i];
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.name === "Sam") {
                        return [
                            ...prev.slice(0, -1),
                            { name: "Sam", message: lastMessage.message + currentChar }
                        ];
                    } else {
                        return [...prev, { name: "Sam", message: currentChar }];
                    }
                });
                i++;
            } else {
                console.log("Finish");
                clearInterval(interval);
                isTypingRef.current = false; // done typing
                setTimeout(() => {
                    setsuggestedquestion(suggestion);
                    setTypingRenderToggle(prev => !prev); // Force re-render here too
                    console.log("Finished typing and suggestion set.");
                }, 10); // Delay to ensure UI updates before suggestion


            }
        }, 1); // Typing speed
    };



    const handleKeyUp = (event) => {
        if (event.key === 'Enter' && !Loader) {
            handleSendMessage(inputText);
        }
    };
    const messagesContainerRef = useRef(null);
    const handleScrollToTop = () => {
        if (chatboxMsgDivRef.current) {
            chatboxMsgDivRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleScrollToDown = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, suggestedquestion]);

    // Auto-scroll to top when switching to PDF selection
    useEffect(() => {
        if (Select_Menu === "Select PDF") {
            handleScrollToTop();
        }
    }, [Select_Menu]);

    const fetchPDFFiles = async () => {
        setLoader(true)
        try {
            const response = await fetch(`${BASE_PATH}/pdfs/`, {
                headers: {
                    "Accept": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const text = await response.text(); // Get raw response text
            const data = JSON.parse(text); // Try parsing JSON manually
            // console.log("PDFs", data)
            // console.log(Array.isArray(data) ? data : [])
            setPdfs(Array.isArray(data) ? data : []);
            const filenames = Array.isArray(data) ? data.map(pdf => pdf.file) : [];
            setSelectedpdf(filenames)
            setLoader(false)
        } catch (error) {
            console.error("Error fetching PDFs:", error);
            setPdfs([]); // Ensure pdfs is always an array
        }
    };

    const [frontendSettings, setFrontendSettings] = useState({
        setting: true,
        setting_voice_change: true,
        setting_category: true,
        setting_content_improver: true,
        setting_qa_history: true,
        acts_and_rules: true,
        faq: true,
        circulars: true,
        manuals: true,
        copy: true,
        speak: true,
        qa_analysis: true
    });
    const fetchFront_End_View = async () => {
        setLoader(true);
        try {
            const response = await fetch(`${BASE_PATH}/FrontEndViewAPI/`, {
                headers: {
                    "Accept": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json(); // Now it's just a single object
            const config = Array.isArray(data) && data.length > 0 ? data[0] : {};
            setFrontendSettings(config)
            console.log("Setting:", config);
            // You can now access: data.setting, data.speak, etc.
        } catch (error) {
            console.error("Error fetching FrontEndView:", error);
        } finally {
            setLoader(false);
        }
    };

    const fetchPDFCatrgory = async () => {
        setLoader(true)
        try {
            const response = await fetch(`${BASE_PATH}/pdfsCategory/`, {
                headers: {
                    "Accept": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();; // Get raw response data
            // console.log("PDF Category", data)
            // console.log(Array.isArray(data) ? data : [])
            setPdfsCategory(data);
            setLoader(false)
        } catch (error) {
            console.error("Error fetching PDFs:", error);
            setPdfsCategory([]); // Ensure pdfs is always an array
        }
    };

    useEffect(() => {
        fetchPDFFiles()
        fetchPDFCatrgory()
        fetchFront_End_View()
        // const files = fetchPDFFiles();
        // setPdfs(files);
    }, [])

    const getdefaultdandomquestion = useCallback(async (selectedPDF) => {
        if (!selectedPDF) {
            return;
        }
        setLoader(true);
        try {
            const response = await fetch(`${BASE_PATH}/GetRandomQuestion/`, {
                method: 'POST',
                body: JSON.stringify({ selectedmode: extractFileName(selectedPDF) }),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            // setsuggestedquestion(data.random_questions);
            console.log("data", data.random_questions);
            setLoader(false);
        } catch (error) {
            console.error('Error:', error);
        }
    }, [BASE_PATH, extractFileName, setsuggestedquestion, setLoader]); // Add dependencies

    // useEffect(() => {
    //     getdefaultdandomquestion(selectedPDF);
    // }, [selectedPDF, getdefaultdandomquestion]); // Add getdefaultdandomquestion

    const [isListening, setIsListening] = useState(false);
    const startListening = () => SpeechRecognition.startListening();
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    useEffect(() => {
        setInputText(transcript)
    }, [transcript]);

    useEffect(() => {
        setIsListening(listening)
    }, [listening]);





    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => setInputText(event.results[0][0].transcript);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
    }, []);

    useEffect(() => {
        if (isListening === false) {
            handleSendMessage(inputText)
        }

    }, [isListening])
    // const startListening = () => {
    //     setInputText("");
    //     recognitionRef.current?.start();
    // };
    const stopListening = () => {
        recognitionRef.current?.stop(); // Will trigger onend
    };

    // const speak = () => {
    //     if (!inputText) return;
    //     const utterance = new SpeechSynthesisUtterance(inputText);
    //     utterance.lang = "en-US";
    //     speechSynthesis.speak(utterance);
    // };


    const [voices, setVoices] = useState([]);
    const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState(null);

    // Detect Browser Name
    const getBrowserName = () => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Chrome") && !userAgent.includes("Edge") && !userAgent.includes("OPR")) return "Chrome";
        if (userAgent.includes("Firefox")) return "Firefox";
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
        if (userAgent.includes("OPR") || userAgent.includes("Opera")) return "Opera";
        if (userAgent.includes("Edge")) return "Edge";
        return "Unknown";
    };
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            // console.log("Available voices:", availableVoices);
            const browser = getBrowserName();
            console.log("Detected browser:", browser);
            let defaultVoice;
            // Browser-specific default voices
            switch (browser) {
                case "Chrome":
                    defaultVoice = availableVoices.find(voice => voice.name.includes("Neerja") || voice.lang === "hi-IN");
                    break;
                case "Edge":
                    defaultVoice = availableVoices.find(voice => voice.name.includes("Microsoft Neerja Online (Natural) - English (India)") || voice.lang === "hi-IN");
                    break;
                case "Firefox":
                    defaultVoice = availableVoices.find(voice => voice.lang === "hi-IN");
                    break;
                case "Safari":
                    defaultVoice = availableVoices.find(voice => voice.lang === "hi-IN");
                    break;
                default:
                    defaultVoice = availableVoices.find(voice => voice.lang === "hi-IN");
                    break;
            }
            const safeIndex = defaultVoice !== -1 ? defaultVoice : 0;
            console.log("defaultVoice:", defaultVoice);
            setSelectedVoice(availableVoices[safeIndex]);
            setSelectedVoiceIndex(safeIndex); // 💡 sets default selected

        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const [Speaking, setSpeaking] = useState(false)
    const [speakdata, setspeakdata] = useState("")
    const speak = (text) => {
        if (!text.trim()) return;
        setSpeaking(true)
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice; // Set selected voice
        utterance.lang = selectedVoice?.lang || "hi-IN";
        utterance.volume = 1;  // Full volume
        utterance.rate = 1.2;    // Normal speed
        utterance.pitch = 1;   // Normal pitch
        utterance.onend = () => {
            console.log("Speech finished");
            // startListening();
            setSpeaking(false)
        };
        window.speechSynthesis.speak(utterance);
    };
    const stopSpeak = () => {
        setSpeaking(false)
        window.speechSynthesis.cancel();
    };


    // State for copy feedback
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedType, setCopiedType] = useState('');

    // Function to copy rendered HTML as plain text to clipboard
    const copyToClipboard = (markdownText, index, type) => {
        // Convert Markdown to HTML
        const rawHtml = marked(markdownText || '');
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);

        // Create a temporary DOM element to extract plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedHtml;
        const plainText = tempDiv.textContent || tempDiv.innerText || ''; // Extract plain text

        if (!plainText.trim()) {
            if (type === 'improve') {
                console.error('No content to copy.');
            } else {
                console.error('No content to copy.');
            }
            return;
        }

        navigator.clipboard.writeText(plainText).then(() => {
            setCopiedIndex(index);
            setCopiedType(type);
            // Reset the "Copied!" message after 2 seconds
            setTimeout(() => {
                setCopiedIndex(null);
                setCopiedType('');
            }, 4000);
        }).catch((err) => {
            console.error('Failed to copy text: ', err);
            if (type === 'improve') {
                console.error('Failed to copy content.');
            } else {
                console.error('Failed to copy content.');
            }
        });
    };

    // Detect if the device is mobile
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Consider devices with width <= 768px as mobile
            setIsMobile(window.innerWidth <= 768);
        };

        // Check on mount
        checkMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkMobile);

        // Cleanup listener on unmount
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Modified render for the iframe section
    const renderIframe = () => {
        if (!selectedPDF) {
            return <div className="text-center mt-3">No PDF Selected</div>;
        }

        if (isMobile) {
            // Render modal for mobile devices
            return (
                <>
                    {frontendSettings.fullChatbot && (
                        <>
                            {zoomed && (
                                <div
                                    className="modal fade show d-block"
                                    tabIndex="-1"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                                    onClick={() => setzoomed(false)}
                                >
                                    <div
                                        className="modal-dialog modal-dialog-centered modal-lg"
                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                                    >
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">{selectedPDFName}</h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() => setzoomed(false)}
                                                ></button>
                                            </div>
                                            <div className="modal-body" style={{ height: '70vh' }}>
                                                {!GotopageNumber && (
                                                    <>
                                                        {console.log("iframesrc", iframesrc)}
                                                        {/* <Document file={`${iframesrc}`}
                                                            onLoadSuccess={onDocumentLoadSuccess}>
                                                            <Page pageNumber={pageNumber} />
                                                        </Document> */}
                                                        <iframe
                                                            src={`${iframesrc}#page=${pageNumber}&view=FitH&zoom=50`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                border: 'none',
                                                                objectFit: 'contain', // Ensure content fits
                                                            }}
                                                            title="show pdf"
                                                        ></iframe>

                                                    </>

                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </>
            );
        } else {
            // Render inline for non-mobile devices
            return (
                <div className="chatbox__iframe position-relative" style={{ marginRight: '10px' }}>
                    <i
                        className="cursor-pointer bi bi-x-circle me-1 fs-5 position-absolute top-0 end-0 text-danger"
                        onClick={() => setzoomed(false)}
                    ></i>
                    {!GotopageNumber && (
                        <>
                            {console.log("iframesrc", iframesrc)}
                            {/* <Document file={`${iframesrc}`}
                                onLoadSuccess={onDocumentLoadSuccess}>
                                <Page pageNumber={pageNumber} />
                            </Document> */}
                            <iframe
                                src={`${iframesrc}#page=${pageNumber}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    objectFit: 'contain', // Ensure content fits
                                }}
                                title="show pdf"
                            ></iframe>
                        </>

                    )}
                </div>
            );
        }
    };

    // --- Magnify header character effect ---
    // Remove headerCharRefs, handleHeaderCharMagnify, resetHeaderCharMagnify

    const [avatarEntered, setAvatarEntered] = useState(false);
    useEffect(() => {
      if (isActive) {
        setAvatarEntered(false);
        setTimeout(() => setAvatarEntered(true), 50); // slight delay for transition
      } else {
        setAvatarEntered(false);
      }
    }, [isActive]);

    const [theme, setTheme] = useState('light'); // 'light' or 'dark'
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const [menuActive, setMenuActive] = useState(false); // NEW: menu icon toggle state

    const [hasPrompted, setHasPrompted] = useState(false); // New state

    // Add this near other refs at the top of the component
    const chatboxMsgDivRef = useRef(null);

    return (
        <div className={`container${theme === 'dark' ? ' chatbot-dark' : ''}`}>
            <div className=' '>
                <div className={` ${isActive ? 'chatbox' : 'chatbox hide-chat'}`} style={
                    menuActive && zoomed
                      ? { width: '45%', height: '88%' }
                      : menuActive && !zoomed
                        ? { width: '98%', height: '88%' }
                        : {}
                }>
                    {isActive && (
                        <div className={`chatbox__support${theme === 'dark' ? ' chatbot-dark' : ''} ${isActive ? 'chatbox--active' : ''}`} 
                          style={menuActive && mobilescreen > 800 ? { height: '100%', width: '100%', overflow: 'hidden' } : menuActive ? { height: '100%', width: '100%' } : {}}>
                            
                            
                            
                            {/* Chatbox__Header */}
                            {/* <div className="chatbox__header position-relative">
                                <div className="modern-header d-flex align-items-center justify-content-between w-100" style={{ minHeight: '72px', width: '100%' }}>
                                    <div className={`header-avatar${avatarEntered ? ' avatar-animate-in' : ''}`}>
                                        <div className="header-avatar-float">
                                            <img 
                                                src={FRONT_PATH + "/assets/Avatar.gif"}
                                                alt="DoT Mitra Avatar"
                                                className="header-avatar-img"
                                            />
                                        </div>
                                    </div>
                                    <div className="header-content flex-grow-1 d-flex justify-content-center">
                                        <h4
                                            className="chatbox__heading--header"
                                            onClick={() => window.open('https://eservices.dot.gov.in/', '_blank')}
                                            style={{ userSelect: 'none', margin: 0, cursor: 'pointer' }}
                                        >
                                            {Array.from('DoT Mitra').map((char, idx) => (
                                                <span
                                                    key={idx}
                                                    className="header-bounce-char"
                                                    style={{ display: 'inline-block', animationDelay: `${idx * 0.1}s` }}
                                                >
                                                    {char === ' ' ? '\u00A0' : char}
                                                </span>
                                            ))}
                                        </h4>
                                    </div>
                                </div>
                            </div> */}




                            {llm_Mode ?
                                <div className='p-5'
                                >
                                    <div className="text-center">
                                        {Loader ? (
                                            <div style={{ position: "relative" }}>
                                                <img
                                                    src={FRONT_PATH + "/assets/avatarThinking.gif"}
                                                    alt="Thinking Icon"
                                                    style={{ width: '350px', height: '350px' }}
                                                />
                                                <div className='Lineshadow' ></div>
                                                <div>Stay tuned </div>
                                            </div>

                                        ) : Speaking ? (
                                            <div style={{ position: "relative" }}>
                                                <img
                                                    // src={SpeakImage}
                                                    src={FRONT_PATH + "/assets/avatarSpeak.gif"}
                                                    alt="Speaking Icon"
                                                    style={{ width: '350px', height: '350px' }}
                                                />
                                                <div className='Lineshadow' ></div>
                                                <div className="audio-wave" id="audio-wave">
                                                    <div className="wave-bar"></div>
                                                    <div className="wave-bar"></div>
                                                    <div className="wave-bar"></div>
                                                    <div className="wave-bar"></div>
                                                    <div className="wave-bar"></div>
                                                </div>
                                            </div>

                                        ) : (
                                            <div style={{ position: "relative" }}>
                                                <img
                                                    src={FRONT_PATH + "/assets/AvatarSanding.gif"}
                                                    alt="User Icon"
                                                    style={{ width: '350px', height: '350px' }}
                                                />
                                                <div className='Lineshadow' ></div>
                                                <div>I'm ready to assist; just share your input</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className='d-flex justify-content-around'>
                                        <button className='btn bi bi-x-circle-fill text-danger fs-1' onClick={() => setLLM_MODE(false)}></button>
                                        {Speaking ?
                                            <button className='btn bi bi-stop-circle-fill text-danger fs-1' onClick={() => stopSpeak()}></button>
                                            :
                                            <button className='btn bi bi-mic text-danger fs-1' onClick={() => startListening()}></button>
                                        }
                                    </div>

                                </div>

                                :
                                <>

                                    <div className="chatbox__container "
                                      style={menuActive && mobilescreen > 800 ? {borderBottomLeftRadius: '50px !important', borderBottomRightRadius: '29px !important'  } : {}}>
                                        {zoomed && renderIframe()}


                                        {mobilescreen < 800 ? <div className='d-flex justify-content-between back__button'>
                                            <>
                                                {Select_Menu && (
                                                    <i className="bi bi-house cursor-pointer btn btn-outline-primary text-dark" onClick={() => { handleScrollToTop(); setSelect_Menu(""); }} title='Home'></i>
                                                )}
                                                
                                                <div className=' w-100'>
                                                    {Select_Menu === "Select PDF" &&
                                                        <>
                                                            {selectedPDF ?
                                                                <div className='d-flex align-items-center'>

                                                                    <div className='me-3 Customshaow'>

                                                                        <button onClick={() => { setSelectedPDF(""); setsuggestedquestion([]); }}
                                                                            className="btn btn-outline-primary  bi bi-arrow-left ">
                                                                        </button>
                                                                    </div>
                                                                    <nav >
                                                                        <ol className="breadcrumb mb-0">
                                                                            <li className="breadcrumb-item"
                                                                                onClick={() => { setSelectedPDF(""); setsuggestedquestion([]); }}
                                                                            ><a href="#">{TabName}</a></li>
                                                                            <li className="breadcrumb-item active" aria-current="page"

                                                                            >{selectedPDFName}</li>
                                                                        </ol>
                                                                    </nav>

                                                                </div>
                                                                :
                                                                <div className='d-flex align-items-center'>
                                                                    <div className='me-3 Customshaow'>
                                                                        <button onClick={() => setSelect_Menu("")}
                                                                            className="btn btn-outline-primary bi bi-arrow-left">
                                                                        </button>
                                                                    </div>

                                                                    <div className="input-group Customshaow me-3" style={{ width: '40%' }}>
                                                                        <label className="input-group-text bg-white bi bi-search" for="inputGroupSelect01"></label>
                                                                        <input type='text' placeholder='Search pdf... ' className='form-control ' onChange={(e) => setSearchQuery(e.target.value)} />

                                                                    </div>

                                                                </div>
                                                            }
                                                        </>}



                                                    {Select_Menu === "Select a Service" && (
                                                        <>
                                                            {!Select_Sub_Services &&
                                                                <>
                                                                    {Select_Services ?
                                                                        <div className='d-flex justify-content-around '>
                                                                            <button onClick={() => { setSelectedPDF(""); setSelect_Services(""); handleScrollToTop(); }}
                                                                                className="btn btn-sm btn-primary bi bi-chevron-left text-white " title='Back'>
                                                                            </button>
                                                                            <button onClick={() => { setSelectedPDF(""); setSelect_Services("") }}
                                                                                className='btn btn-sm  d-flex rounded-pill text-start '
                                                                            >
                                                                                {Select_Services}
                                                                            </button>

                                                                        </div>
                                                                        :
                                                                        <button onClick={() => { setSelectedPDF(""); setSelect_Menu(""); handleScrollToTop(); }}
                                                                            className="btn btn-sm btn-primary  bi bi-chevron-left " title='Back'>
                                                                        </button>
                                                                    }
                                                                </>
                                                            }


                                                            {Select_Services === "Industry Services" &&
                                                                <>
                                                                    {Select_Sub_Services &&

                                                                        <div className=''>
                                                                            <button onClick={() => { setSelectedPDF(""); setSelect_Sub_Services(""); handleScrollToTop(); }}
                                                                                className="btn btn-sm btn-primary bi bi-chevron-left " title='Back'>
                                                                            </button>
                                                                            <button className='btn btn-sm border border-1 rounded-pill text-start'>{Select_Services}</button>
                                                                            <button className='btn btn-sm border border-1 rounded-pill text-start'>{Select_Sub_Services}</button>
                                                                        </div>

                                                                    }
                                                                </>}
                                                        </>
                                                    )}


                                                    {Select_Menu === "All" &&
                                                        <button onClick={() => { setSelect_Menu(""); handleScrollToTop(); }}
                                                            className="btn btn-sm btn-primary bi bi-chevron-left " title='Back'>
                                                        </button>}


                                                </div>



                                            </>

                                        </div> : null}



                                        <div className="chatbox__messages" ref={messagesContainerRef}>


                                            {mobilescreen > 800 ? <div className='d-flex justify-content-between back__button'>
                                                {/* {Select_Menu && (
                                                    <i className="bi bi-house btn btn-outline-primary text-dark" onClick={() => { handleScrollToTop(); setSelect_Menu(""); }} title='Home'></i>
                                                )} */}
                                                <div className=' w-100'>

                                                <div className="header-toggle-row d-flex align-items-center justify-content-between">
                                                  <div className='d-flex align-items-center'>
                                                  <div className='menu-icon' tabIndex={0} role='button' aria-label='Menu' onClick={() => setMenuActive((prev) => !prev)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" width="28" height="28"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
                                                  </div>
                                                  <div className='darkmode-toggle-row d-flex align-items-center mb-3 mt-2'>
                                                    <span className='me-1'><i className={`bi bi-moon${theme === 'dark' ? '-fill' : ''}`}></i></span>
                                                    <div className="form-check form-switch ms-2">
                                                      <input className="form-check-input" type="checkbox" id="themeSwitch" checked={theme === 'dark'} onChange={toggleTheme} />
                                                    </div>
                                                  </div>
                                                  </div>
                                                  <button className="header-close-btn-svg me-4" onClick={() => { setIsActive(!isActive); setzoomed(false); }} aria-label="Close">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="28" height="28" fill="#bbb"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                                                  </button>
                                                </div>



                                                    {Select_Menu === "Select PDF" &&
                                                        <>
                                                            {selectedPDF ?
                                                                <div className='d-flex align-items-center'>
                                                                    <div className='me-3 Customshaow'>
                                                                        <button onClick={() => { setSelectedPDF(""); setsuggestedquestion([]); }}
                                                                            className="btn btn-outline-primary  bi bi-arrow-left ">
                                                                        </button>
                                                                    </div>
                                                                    <nav >
                                                                        <ol className="breadcrumb mb-0">
                                                                            <li className="breadcrumb-item"
                                                                                onClick={() => { setSelectedPDF(""); setsuggestedquestion([]); }}
                                                                            ><a href="#">{TabName}</a></li>
                                                                            <li className="breadcrumb-item active" aria-current="page"

                                                                            >{selectedPDFName}</li>
                                                                        </ol>
                                                                    </nav>

                                                                </div>
                                                                :
                                                                <div className='d-flex align-items-center justify-content-between' style={{ marginLeft: 20 }}>
                                                                    {/* <div className='me-3 Customshaow'>
                                                                        <button onClick={() => setSelect_Menu("")}
                                                                            className="btn btn-outline-primary bi bi-arrow-left">
                                                                        </button>
                                                                    </div> */}

                                                                    {/* <div className="input-group Customshaow me-3" style={{ width: '40%' }}>
                                                                        <input type='text' placeholder='Search pdf... ' className='form-control ' onChange={(e) => setSearchQuery(e.target.value)} />
                                                                        <label className="input-group-text bg-white bi bi-search" for="inputGroupSelect01"></label>

                                                                    </div> */}

                                                                </div>

                                                            }
                                                        </>}

                                                    {Select_Menu === "Select a Service" && (
                                                        <>
                                                            {!Select_Sub_Services &&
                                                                <>
                                                                    {Select_Services ?
                                                                        <div className='d-flex justify-content-around '>
                                                                            <button onClick={() => { setSelectedPDF(""); setSelect_Services(""); handleScrollToTop(); }}
                                                                                className="btn btn-sm btn-primary bi bi-chevron-left text-white " title='Back'>
                                                                            </button>
                                                                            <button onClick={() => { setSelectedPDF(""); setSelect_Services("") }}
                                                                                className='btn btn-sm  d-flex rounded-pill text-start '
                                                                            >
                                                                                {Select_Services}
                                                                            </button>

                                                                        </div>
                                                                        :
                                                                        <button onClick={() => { setSelectedPDF(""); setSelect_Menu(""); handleScrollToTop(); }}
                                                                            className="btn btn-sm btn-primary  bi bi-chevron-left " title='Back'>
                                                                        </button>
                                                                    }
                                                                </>
                                                            }
                                                            {Select_Services === "Industry Services" &&
                                                                <>
                                                                    {Select_Sub_Services &&

                                                                        <div className=''>
                                                                            <button onClick={() => { setSelectedPDF(""); setSelect_Sub_Services(""); handleScrollToTop(); }}
                                                                                className="btn btn-sm btn-primary bi bi-chevron-left " title='Back'>
                                                                            </button>
                                                                            <button className='btn btn-sm border border-1 rounded-pill text-start'>{Select_Services}</button>
                                                                            <button className='btn btn-sm border border-1 rounded-pill text-start'>{Select_Sub_Services}</button>
                                                                        </div>

                                                                    }
                                                                </>
                                                            }
                                                        </>
                                                    )}





                                                    {Select_Menu === "All" &&
                                                        <button onClick={() => { setSelect_Menu(""); handleScrollToTop(); }}
                                                            className="btn btn-sm btn-primary bi bi-chevron-left " title='Back'>
                                                        </button>}

                                                </div>





                                            </div> : null}









                                            {isActive && (
                                                <div
                                                    className="chatbox-flex-row"
                                                    style={menuActive && mobilescreen > 800
                                                        ? { display: 'flex', flexDirection: 'row', width: '100%', height: '90%' }
                                                        : {}}
                                                >
                                                    {menuActive && mobilescreen > 800 && (
                                                        <div
                                                            className="category-menu"
                                                            style={{
                                                                width: '20%', // Changed from 35% to 20%
                                                                height: '100%',
                                                                padding: '32px 20px 0 20px',
                                                                boxSizing: 'border-box',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '1px',
                                                                color: 'white',
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                                <i className="bi bi-grid" style={{ color: '#2563eb', fontSize: 26, lineHeight: 1 }}></i>
                                                                <span 
                                                                  style={{ 
                                                                    fontWeight: 700, 
                                                                    fontSize: 20, 
                                                                    color: theme === 'dark' ? 'white' : '#2c3e50', 
                                                                    letterSpacing: 0 
                                                                  }}
                                                                >
                                                                  Category
                                                                </span>
                                                            </div>




                                                            <button
                                                                onClick={() => { setSelect_Menu("Select PDF"); setSelectedPDF(""); setTabName('FAQ'); handleScrollToTop(); }}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: theme === 'dark' ? '#151820' : '#f8f8ff', border: 'none',    padding: '12px 1px', fontWeight: 500, fontSize: 16, color: theme === 'dark' ? '#fff' : '#222', cursor: 'pointer'
                                                                }}
                                                            >
                                                                <i className="bi bi-patch-question" style={{ color: '#2563eb', fontSize: 22 }}></i>
                                                                FAQs
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelect_Menu("Select PDF"); setSelectedPDF(""); setTabName('Acts and Rules'); handleScrollToTop(); }}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: theme === 'dark' ? '#151820' : '#f8f8ff', border: 'none',    padding: '12px 1px', fontWeight: 500, fontSize: 16, color: theme === 'dark' ? '#fff' : '#222', cursor: 'pointer'
                                                                }}
                                                            >
                                                                <i className="bi bi-patch-question" style={{ color: '#2563eb', fontSize: 22 }}></i>
                                                                Acts & Rules
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelect_Menu("Select PDF"); setSelectedPDF(""); setTabName('Acts and Rules'); handleScrollToTop(); }}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: theme === 'dark' ? '#151820' : '#f8f8ff', border: 'none',    padding: '12px 1px', fontWeight: 500, fontSize: 16, color: theme === 'dark' ? '#fff' : '#222', cursor: 'pointer'
                                                                }}
                                                            >
                                                                <i className="bi bi-patch-question" style={{ color: '#2563eb', fontSize: 22 }}></i>
                                                                Acts & Rules
                                                            </button>
                                                                <div>
                                                                                    <input className='form-check-input'
                                                                                        type="checkbox"
                                                                                        checked={selectedpdf.length !== searchPdfs.length}
                                                                                        onClick={toggleSelectAll}
                                                                                    />
                                                                                    <span className='ms-2' style={{ color: theme === 'dark' ? '#fff' : '#222' }}>
                                                                                        Select All
                                                                                        {/* {selectedpdf.length !== searchPdfs.length ? "Deselect" : "Select"} */}
                                                                                    </span>
                                                                                </div>






                                                            <div style={{ overflowY: 'auto', Height: '50%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                                            {searchPdfs().map((pdf) => (
                                                                                    <div
                                                                                        className='d-flex align-items-center form-check'
                                                                                        key={pdf.id} // Add unique key here
                                                                                    >

                                                                                        <input className='form-check-input'
                                                                                            type="checkbox"
                                                                                            checked={selectedpdf.includes(pdf.file)}
                                                                                            onChange={() => toggle(pdf.file)}
                                                                                        />


                                                                                        <div
                                                                                            // onClick={(e) => { setSelectedPDFName(pdf.filename); setSelectedPDF(pdf.file); setsuggestedquestion([]); handleScrollToDown(); setzoomed(true); }}
                                                                                            onClick={(e) => { setSelectedPDFName(pdf.filename); setSelectedpdf([pdf.file]); setSelectedPDF(pdf.file); setsuggestedquestion([]); handleScrollToDown(); setzoomed(true); fetchRandomQuestions([pdf.file.split('/').pop()]) }}

                                                                                            className='btn btn-sm btn-gray-500  truncate rounded-pill text-start'
                                                                                            key={pdf.id} value={pdf.file}>
                                                                                            <i className="bi-file-earmark-pdf me-2 text-primary"></i>
                                                                                            <span className={`${selectedpdf.includes(pdf.file) ? "text-primary" : ""}`}>{pdf.filename || pdf.file.split("/").pop()}</span>

                                                        </div>


                                                                                    </div>


                                                                ))}
                                                            </div>                 





                                                        </div>








                                                        
                                                    )}
                                                    <div style={menuActive && mobilescreen > 800 ? { width: '80%', height: '100%' } : { width: '100%', height: '100%' }}>
                                                        <div className="chatbot-conversation-interface" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative'}}>
                                                            <div className='p-3 chatboxMsgDiv' ref={chatboxMsgDivRef} style={{ flex: 1, overflowY: 'auto', width: '100%', position: 'relative'}}>
                                                                {!hasPrompted && !Select_Menu && (
                                                                    <div className='suggestedPromptsSection'>
                                                                        <h5 className="suggestedPromptsTitle mb-3">Suggested Prompts</h5>
                                                                        <div className="suggestedPromptsContainer">
                                                                            {suggestedPrompts.map((prompt, index) => (
                                                                                <button 
                                                                                    key={index}
                                                                                    className="suggestedPromptBtn"
                                                                                    onClick={() => {
                                                                                        setInputText(prompt);
                                                                                        inputRef.current?.focus();
                                                                                    }}
                                                                                >
                                                                                    {prompt}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}




                                                                {Select_Menu === "Select PDF" &&
                                                                    <>
                                                                        {!selectedPDF &&
                                                                            (<div>
                                                                                {TabName === "Acts and Rules" && (
                                                                                    <div className="mb-4">
                                                                                        <div className="scroll-container d-flex flex-nowrap gap-2 justify-content-start">
                                                                                            <div className={`btn btn-sm Customshaow ${CategoryName === "" ? "bg-primary text-white" : "btn-outline-secondary bg-white text-dark"}`} onClick={() => setCategoryName("")}>
                                                                                                ALL
                                                                                            </div>
                                                                                            {pdfsCategory.map((category) => (
                                                                                                <div
                                                                                                    className={`btn btn-sm Customshaow  ${CategoryName === category.fileCategoryName ? "bg-black text-white" : "btn-outline-secondary bg-white text-dark "}`}
                                                                                                    key={category.id}
                                                                                                    onClick={() => setCategoryName(category.fileCategoryName)}
                                                                                                >
                                                                                                    {category.fileCategoryName}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                )}


                                                                                

                                                                            </div>)
                                                                        }


                                                                    </>
                                                                }




                                                                {Select_Menu === "Select a Service" &&
                                                                    <>
                                                                        {!Select_Sub_Services &&
                                                                            <>
                                                                                {!Select_Services &&

                                                                                    <>
                                                                                        <button onClick={() => { setSelectedPDF("All_eservies"); setSelect_Services("All_eservies"); handleScrollToDown(); }}
                                                                                            className='btn btn-sm m-1 border border-1 d-flex truncate rounded-pill text-start'
                                                                                        >
                                                                                            All Services
                                                                                        </button>
                                                                                        <button onClick={() => { setSelectedPDF("AboutUs"); setSelect_Services("About Us"); handleScrollToDown(); }}
                                                                                            className='btn btn-sm m-1 border border-1 d-flex truncate rounded-pill text-start'
                                                                                        >
                                                                                            About Us
                                                                                        </button>
                                                                                        <button onClick={() => { setSelect_Services("Industry Services") }}
                                                                                            className='btn btn-sm m-1 border border-1 d-flex truncate rounded-pill text-start'
                                                                                        >
                                                                                            Industry Services
                                                                                        </button>

                                                                                        <button onClick={() => { setSelectedPDF("Standards"); setSelect_Services("Standards"); handleScrollToDown(); }}
                                                                                            className='btn btn-sm m-1 border border-1 d-flex truncate rounded-pill text-start'
                                                                                        >
                                                                                            Standards
                                                                                        </button>


                                                                                    </>
                                                                                }
                                                                            </>
                                                                        }

                                                                        {Select_Services === "Industry Services" &&
                                                                            <>
                                                                                {!Select_Sub_Services &&
                                                                                    <>
                                                                                        <button onClick={() => { setSelectedPDF("UnifiedLicense"); setSelect_Sub_Services("Unified License"); handleScrollToDown(); }}
                                                                                            className='btn btn-sm m-1 border border-1 d-flex truncate rounded-pill text-start'
                                                                                        >
                                                                                            Unified License (UL)
                                                                                        </button>
                                                                                        <button onClick={() => { setSelectedPDF("SACFA"); setSelect_Sub_Services("SACFA"); handleScrollToDown(); }}
                                                                                            className='btn btn-sm m-1 border border-1 d-flex truncate rounded-pill text-start'
                                                                                        >
                                                                                            SACFA
                                                                                        </button>
                                                                                        <button onClick={() => { setSelectedPDF("RightofWayRelated"); setSelect_Sub_Services("Right of Way Related"); handleScrollToDown(); }}
                                                                                            className='btn btn-sm m-1 border border-1 d-flex truncate rounded-pill text-start'
                                                                                        >
                                                                                            Right of Way Related
                                                                                        </button>
                                                                                    </>


                                                                                }


                                                                            </>
                                                                        }
                                                                    </>}





                                                                {messages.map((msg, index) => (
                                                                    <>
                                                                        <div className='d-flex ' key={index}>
                                                                            <div className={`messages__item mb-2 ${msg.name === 'Sam' ? 'messages__item--visitor' : 'messages__item--operator'}`}>
                                                                                <div className="chat-message position-relative">
                                                                                    <>
                                                                                        {(msg.name === 'Sam' && analisysdata === msg.message && analisysdataloader) &&
                                                                                            <div className="position-absolute">
                                                                                                <div className="NEWshadow"></div>
                                                                                            </div>
                                                                                        }
                                                                                        {msg.message
                                                                                            ? renderMessageContent(msg.message, triggerGotoPage, msg.suggestion)
                                                                                            :
                                                                                            // <span>{msg.message}</span>
                                                                                            ""
                                                                                        }
                                                                                    </>

                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className='ms-3 d-flex'>
                                                                            {msg.name === 'Sam' &&
                                                                                <>
                                                                                    <div className={` cursor-pointer ${copiedIndex === index && copiedType === 'improve' ? 'bi-clipboard-check' : 'bi-clipboard'}`}
                                                                                        onClick={() => copyToClipboard(msg.message, index, 'improve')}
                                                                                    >

                                                                                    </div>
                                                                                    {/* <div className=' bi-clipboard'></div> */}

                                                                                    {(Speaking && speakdata === msg.message) ?
                                                                                        <div className='bi bi-stop-circle-fill text-danger cursor-pointer ms-2' onClick={() => stopSpeak()}></div>
                                                                                        :
                                                                                        <div className='bi bi-volume-up cursor-pointer ms-2 fs-7' onClick={() => {
                                                                                            const cleaned = msg.message
                                                                                                .replace(/[*\-_~`]+/g, "") // Remove markdown
                                                                                                .replace(/Question:\s*\d+/gi, "") // Remove question number
                                                                                                .replace(/Page:\s*\d+/gi, "") // Remove page number
                                                                                                .replace(/Answering from https:\/\/eservices\.dot\.gov\.in\/faqs/gi, "") // Remove FAQ link
                                                                                                .trim();
                                                                                            speak(cleaned); setspeakdata(msg.message);
                                                                                        }}>
                                                                                        </div>
                                                                                    }
                                                                                    {frontendSettings.qa_analysis && (
                                                                                        <div className='bi bi-cpu cursor-pointer ms-2 fs-7' onClick={() => {
                                                                                            Analysysdata(index, index - 1);
                                                                                            setanalisysdata(msg.message);
                                                                                        }}>
                                                                                        </div>
                                                                                    )}

                                                                                </>

                                                                            }



                                                                        </div>
                                                                        {analisysdata === msg.message &&
                                                                            <div style={{ width: "90vw" }}>
                                                                                <b className='ms-3'>Is the answer related to the question asked?</b>
                                                                                <span

                                                                                    dangerouslySetInnerHTML={{ __html: sanitizeMessage(analizeddata) }}
                                                                                />
                                                                            </div>

                                                                        }

                                                                    </>
                                                                ))}





                                                                <div ref={messagesEndRef} />
                                                                {TabName && (
                                                                    <>
                                                                        {(suggestedquestion && suggestedquestion.length >= 1) && <div className='suggestedQuestionTitle mt-3 mb-3 px-3'>Suggested Questions</div>}
                                                                        {Loader && <div className="loader"></div>}
                                                                        <span className="parentQuestionBtn">
                                                                            {suggestedquestion.map((suggestion, index) => (
                                                                                suggestion && suggestion.length > 0 ? (
                                                                                    <button
                                                                                        className="question-button ms-3 px-3 py-1"
                                                                                        onClick={() => handleSendsuggestion(suggestion)}
                                                                                        key={index}
                                                                                    >
                                                                                        {suggestion}
                                                                                    </button>
                                                                                ) : null
                                                                            ))}
                                                                            <div ref={messagesEndRef} />
                                                                        </span>
                                                                    </>
                                                                )}

                                                            </div>
                                                            {isActive && <div 
                                                              className="chatbox__footer" 
                                                              style={
                                                                menuActive && mobilescreen > 800
                                                                  ? {
                                                                      position: 'absolute',
                                                                      left: 0,
                                                                      right: 0,
                                                                      bottom: 0,
                                                                      width: '100%',
                                                                      flexShrink: 0,
                                                                      zIndex: 123457,
                                                                      marginBottom: 0, // Ensure no bottom margin when menuActive is true
                                                                    }
                                                                  : {
                                                                      position: 'fixed',
                                                                      right: 10,
                                                                      bottom: 10, // was 20, now 30
                                                                      width: '98%', //chatbox width
                                                                      flexShrink: 0,
                                                                      zIndex: 123457,
                                                                    }
                                                              }
                                                            >
                                                                <div className="input-container inputshadow">
                                                                    <input type="text"
                                                                        placeholder={"Ask question from DoT Mitra..."}
                                                                        value={inputText}
                                                                        onChange={(e) => setInputText(e.target.value)}
                                                                        onKeyUp={handleKeyUp}
                                                                        ref={inputRef} // Add ref
                                                                    // disabled={!Select_Menu || !selectedPDF}
                                                                    // className={`input-field ${!Select_Menu || !selectedPDF ? "disabled" : ""}`}
                                                                    />
                                                                    {inputText ?
                                                                        <i onClick={() => handleSendMessage(inputText)} className="material-icons cursor-pointer me-2">&#xe163;</i>
                                                                        :
                                                                        <i className='cursor-pointer'

                                                                        >
                                                                            {!isTypingRef.current ?
                                                                                <>
                                                                                    {isListening ?
                                                                                        <button className="mic_btn me-2" onClick={() => stopListening()}>
                                                                                            <div className="pulse-ring"></div>
                                                                                            <i className="bi bi-mic fs-6 text-white"></i>
                                                                                        </button>
                                                                                        : <i className={`bi bi-mic-mute fs-5 text-primary  m-2 input-field`}
                                                                                            // className="bi bi-mic-mute fs-6 text-primary  m-2"
                                                                                            onClick={() => startListening()}
                                                                                            style={{ backgroundColor: "#ffffff", borderRadius: "50%", padding: "10px 7px", marginRight: "2px" }}></i>
                                                                                    }
                                                                                </>
                                                                                :
                                                                                <i className="bi-stop-circle-fill me-2 fs-6" onClick={() => { isTypingRef.current = false; setTypingRenderToggle(prev => !prev); }}></i>
                                                                            }

                                                                        </i>
                                                                    }
                                                                    {frontendSettings.setting && (
                                                                        <i className='cursor-pointer fs-4 bi-gear me-2 text-dark' title="Settings" onClick={() => { setShowVoiceSetting(!ShowVoiceSetting); }}></i>
                                                                    )}
                                                                </div>
                                                                {messages.length > 0 && (
                                                                    <div className='position-absolute start-0 w-100 p-1 text-center' style={{ fontSize: "10px", bottom: "-4px" }}>
                                                                        * AI responses may be incorrect. Always verify with the original document..
                                                                    </div>
                                                                )}
                                                                {frontendSettings.fullVoice && (
                                                                    <div className=" ms-2 cursor-pointer VoiceAssitent"
                                                                        onClick={() => { setLLM_MODE(true); setSelectedPDF("All_PDF"); speak("Hi There, D O T Mitra is here to help you"); }}
                                                                    >
                                                                        <img src={FRONT_PATH + "/assets/hugeicons_ai-voice.svg"} />
                                                                    </div>
                                                                )}

                                                            </div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}





                                        </div>
                                    </div>
                                   
                                   
                                   
                                    
                                    <div className={ShowVoiceSetting ? 'modal-parent h-100  position-absolute end-0 ' : ''}>
                                        <div className={ShowVoiceSetting ? `position-absolute bg-white end-0 px-3 h-100 show-sidebar${theme === 'dark' ? ' chatbot-dark' : ''}` : `position-absolute bg-white end-0 h-100 hide-sidebar${theme === 'dark' ? ' chatbot-dark' : ''}`}>
                                            <div className='text-end'>
                                                <i className='bi bi-x cursor-pointer fs-3 ' title="Voice Settings" onClick={() => { setShowVoiceSetting(!ShowVoiceSetting); }}></i>
                                            </div>

                                            <img src={FRONT_PATH + "/assets/lucide_volume-2.svg"} width="10%" />
                                            <label className='fw-bolder ms-2'>Change Voice </label>
                                            <div
                                            // className='w-100 d-flex justify-content-between border rounded align-items-center p-2 mb-4'
                                            >
                                                {/* Select Voice */}
                                                <select
                                                    value={selectedVoiceIndex}
                                                    onChange={(e) => {
                                                        const index = parseInt(e.target.value, 10);
                                                        setSelectedVoiceIndex(index);
                                                        setSelectedVoice(voices[index]);
                                                    }}
                                                    className="w-100 form-select overlapBot"
                                                >
                                                    {voices.map((voice, index) => (
                                                        <option key={index} value={index}>
                                                            {voice.name} ({voice.lang})
                                                        </option>
                                                    ))}
                                                </select>

                                            </div>
                                            <div className='verticalLine'></div>

                                            <i className="bi-grid text-primary fs-5 me-2"></i>
                                            <label className='fw-bolder'>Category</label>
                                            <div className='mb-4'>
                                                {/* <button onClick={(e) => { setSelect_Menu("All"); setSelectedPDF("All"); setShowVoiceSetting(!ShowVoiceSetting); handleScrollToTop(); }} className="btn border-primary d-flex m-1 w-100 bg-white">
                                        <i className="bi bi-border-all me-2 text-primary shadow-sm overlapBot"></i> All
                                    </button > */}
                                                <button onClick={(e) => { setSelect_Menu("Select PDF"); setSelectedPDF(""); setTabName('FAQ'); setShowVoiceSetting(!ShowVoiceSetting); handleScrollToTop(); }} className="btn d-flex w-100 bg-white overlapBot">
                                                    <i className="bi bi-patch-question me-3 text-primary  "></i> FAQs
                                                </button>
                                                {/* <button onClick={(e) => { setSelect_Menu("Select a Service"); setSelectedPDF(""); setShowVoiceSetting(!ShowVoiceSetting); handleScrollToTop(); }} className="btn d-flex w-100 bg-white overlapBot">
                                        <i className="bi bi-globe2 me-2 text-primary  "></i>  E-Services
                                    </button > */}
                                                <button onClick={(e) => { setSelect_Menu("Select PDF"); setSelectedPDF(""); setTabName("Acts and Rules"); setShowVoiceSetting(!ShowVoiceSetting); handleScrollToTop(); }} className="btn d-flex w-100 bg-white overlapBot">
                                                    <i className="bi bi-vector-pen me-2 text-primary  "></i> Act & Rules
                                                </button>
                                                {frontendSettings.circulars && (
                                                    <button onClick={(e) => { setSelect_Menu("Select PDF"); setSelectedPDF(""); setTabName("Circulars"); setShowVoiceSetting(!ShowVoiceSetting); handleScrollToTop(); }} className="btn d-flex w-100 bg-white overlapBot">
                                                        <i className="bi bi-megaphone me-2 text-primary  "></i> Circulars
                                                    </button>
                                                )}
                                                {frontendSettings.manuals && (
                                                    <button onClick={(e) => { setSelect_Menu(""); setSelectedPDF(""); setShowVoiceSetting(!ShowVoiceSetting); handleScrollToTop(); }} className="btn d-flex w-100 bg-white overlapBot">
                                                        <i className="bi bi-book me-2 text-primary  "></i> Manuals
                                                    </button>
                                                )}

                                            </div>
                                            {/* <div className='verticalLine'></div>
                                        <i className="bi-pencil-square text-primary fs-5 me-2"></i>
                                        <label className='fw-bolder'>Content Writer</label>
                                        <div className='mb-4 '>

                                            <button onClick={(e) => { navigate("/contentwriter"); }} className="btn  d-flex w-100 bg-white overlapBot">
                                                <i className=""></i> Content Writer
                                            </button>

                                        </div> */}

                                            {/* Theme Toggle */}
                                           

                                        </div>
                                    </div>

                                </>
                            }

                        </div>
                    )}



                    {!isActive ?
                        <div className='.chat-widget'>

                            <div className="chatbox__button" >
                                {!activebubble && (
                                    <>

                                        <div className="chat-bubble d-flex justify-content-between align-item-center position-relative">
                                            <p className="mb-0 text-dark ">
                                                {typedText}
                                                {typedText !== fullText && <span className="typing-cursor">|</span>}
                                            </p>
                                            <i className="bi-x-circle-fill chat-bubble-close "
                                                onClick={() => { setactivebubble(!activebubble) }}
                                            ></i>
                                        </div>
                                    </>
                                )}

                                {/* {isIframe && ( */}
                                <div className="avatar ms-auto" onClick={() => { setIsActive(!isActive); setzoomed(false); }}>
                                    <img width="50vh"
                                        // src={DOTMitraIcon}
                                        src={FRONT_PATH + "/assets/Avatar.gif"}
                                        alt="Eric's Avatar" />
                                    <div className="status-dot"></div>
                                </div>
                                {/* )} */}


                            </div>
                        </div>
                        :
                        <>
                            {/* {isIframe && ( */}
                            {/* {mobilescreen > 800 &&
                                <div className="chatbox__button position-absolute bottom-0 end-0" >
                                    <button onClick={() => { setIsActive(!isActive); setzoomed(false); }}>
                                        <i className="bi-arrow-down-circle-fill fs-4 text-success"></i>
                                    </button>
                                </div>
                            } */}
                            {/* )} */}
                        </>


                    }

                </div>
            </div>
        </div>

    );
};

export default Chatbox;


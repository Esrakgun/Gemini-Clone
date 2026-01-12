/* 
  Bu Context dosyası:
  - Kullanıcıdan gelen prompt’u alır
  - Gemini API’ye gönderir
  - Gelen cevabı kelime kelime ekrana yazdırır
  - Loading, sonuç gösterme ve geçmiş prompt’ları yönetir
*/
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import runChat from "./../config/gemini";

// Global state paylaşımı için Context oluşturuluyor
export const Context = createContext();

const ContextProvider = (props) => {
  // Input alanına yazılan prompt
  const [input, setInput] = useState("");

  // Son gönderilen prompt
  const [recentPrompt, setRecentPrompt] = useState("");

  // Önceki prompt’ların listesi
  const [prevPrompts, setPrevPrompts] = useState([]);

  // Sonuç ekranı açık mı kapalı mı
  const [showResult, setShowResult] = useState(false);

  // API isteği devam ediyor mu
  const [loading, setLoading] = useState(false);

  // Gemini’den gelen cevabın ekrana basılan hali
  const [resultData, setResultData] = useState("");

  /*
    delayPara:
    - Gelen cevabı kelime kelime yazdırmak için kullanılır
    - index arttıkça gecikme artar
    - typing (yazı yazılıyormuş) efekti oluşturur
  */
  const delayPara = (index, nextWord) => {
    const isTitle = nextWord.trim().endsWith(":");

    setTimeout(() => {
      setResultData((prev) =>
        isTitle ? prev + `<b>${nextWord}</b> ` : prev + nextWord + " "
      );
    }, 75 * index);
  };

  /*
    newChat:
    - Yeni sohbet başlatmak için kullanılır
    - Sonuç ekranını ve loading’i sıfırlar
  */
  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  /*
    onSent:
    - Kullanıcı prompt gönderdiğinde çalışır
    - Gemini API’ye istek atar
    - Gelen cevabı düzenler
    - Kelime kelime ekrana basar
  */
  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    let response;

    // Prompt parametre olarak geldiyse onu kullan
    if (prompt !== undefined) {
      response = await runChat(prompt);
      setRecentPrompt(prompt);
    }
    // Aksi halde input state’ini kullan
    else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await runChat(input);
    }

    /*
      Gelen response:
      - ** işaretlerine göre bölünüyor
      - Basit HTML formatına çevriliyor
    */
    let responseArray = response.split("**");
    let newResponse = " ";

    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newResponse += responseArray[i];
      } else {
        newResponse += "<br><b>" + responseArray[i] + "</b>";
      }
    }

    // * karakterleri satır sonuna çevriliyor
    let newResponse2 = newResponse.split("*").join("<br/>");

    // Cevap kelimelere ayrılıyor
    let newResponseArray = newResponse2.split(" ");

    // Her kelime gecikmeli şekilde ekrana yazdırılıyor
    for (let i = 0; i < newResponseArray.length; i++) {
      delayPara(i, newResponseArray[i] + " ");
    }

    // Yazı bitince loading kapatılıyor
    setTimeout(() => {
      setLoading(false);
    }, 75 * newResponseArray.length);

    setInput("");
  };

  // Context ile dışarı açılan değerler
  const contextValue = {
    input,
    setInput,
    onSent,
    recentPrompt,
    setRecentPrompt,
    prevPrompts,
    setPrevPrompts,
    showResult,
    setShowResult,
    loading,
    setLoading,
    resultData,
    setResultData,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;

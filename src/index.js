import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import {observable, action} from 'mobx';
import {Provider, observer, inject} from 'mobx-react';

const QUESTIONS = [
    {
        question: 'Who played as HULK in Avengers?', 
        options: [ 
            {image: 'robertDowneyJr'},
            {image: 'markRuffalo'},
            {image: 'chrisEvans'},
            {image: 'jackieChan'}
        ],
    },
    {
        question: 'How many GPS satellites orbit earth?', options: [
            {image: '12'},
            {image: '15'},
            {image: '24'},
            {image: '34'}
        ],
    },
    {
        question: 'Choose the Logo of React',
        options: [
            {image: 'react'},
            {image: 'angular'},
            {image: 'nest'},
            {image: 'electron'}
        ],
    }
];

const MESSAGE = ['Oops!!!', 'Not Bad', 'Good!', 'Holy Amazing!!!'];

// import appCss from './App.module.css';
// import imageCss from './components/Image/Image.module.css';
// import optionsCss from './components/ImageOptions/ImageOptions.module.css';
// import questCss from './components/Question/Question.module.css';
// import howPlayCss from './components/Modal/HowPlayModal/HowPlayModal.module.css';
// import modalCss from './components/Modal/Modal.module.css';
// import resCss from './components/Modal/ResultModal/ResultModal.module.css';

class QuestionStore {
    @observable answerKey = [
        {answer: 'markRuffalo', chosenAns: null, played: false},
        {answer: '24', chosenAns: null, played: false},
        {answer: 'react', chosenAns: null, played: false}
    ];
    @observable ansTracker = {
        answered: 0,
        score: 0
    };
    @observable resultDisp = 'none';
    @observable howPlayDisp = 'none';

    @action setChosenAns = (index, ansChosen) => {
        this.answerKey[index].chosenAns = ansChosen;
        // this.answerKey[index].played = true;
    }
    @action setAnsTracker = (index, ansChosen) => {
        const {chosenAns, played} = this.answerKey[index];
        if(chosenAns && !played) {
            this.ansTracker.answered = this.ansTracker.answered+1;
            this.answerKey[index].played = true;
        }
    }
    @action resultDisplay = () => {
        if(this.ansTracker.answered === 3) {
            this.answerKey.forEach((ans) => {
                if(ans.chosenAns === ans.answer) this.ansTracker.score++;
            });
            return this.resultDisp = 'block';
        }
        this.resultDisp = 'none';
    }
    @action howPlayDisplay = (display) => {
        this.howPlayDisp = display;
    }
    @action resetState = () => {
        this.answerKey.forEach((ans) => {
            ans.chosenAns = null;
            ans.played = false;
        });
        this.ansTracker.answered=0;
        this.ansTracker.score=0;
    }
}

const QuestionsStor = new QuestionStore();

const Root = (
    <Provider QuestionsStore={QuestionsStor}>
        <App/>
    </Provider>
);

////--------MODAL BLOCK-------

//MODAL HOC
@inject('QuestionsStore')
@observer
class Modal extends Component {

    render() {
        return (
            <div style={{display: this.props.display}} className={'backdrop'}>
                <div className={'modal'}>
                    <p className={'header'}>{this.props.modalType}</p>
                    {this.props.children}\
                    <button onClick={this.props.clickAction} className={'replay'}>{this.props.buttonName}</button>
                </div>
            </div>
        );
    }
}

//HOWPLAYMODAL COMPONENT

@inject('QuestionsStore')
@observer
class HowPlayModal extends Component {

    closeButtonClick = () => {
        const {QuestionsStore} = this.props;
        QuestionsStore.howPlayDisplay('none');
    }

    render() {
        const {QuestionsStore} = this.props;
        return (
            <Modal display={QuestionsStore.howPlayDisp} buttonName={'CLOSE'} clickAction={this.closeButtonClick} modalType={'TIPS'}>
                <span className={'tip'}>JUST CLICK ON THE IMAGE</span>
            </Modal>
        );
    }
}

//RESULTMODAL COMPONENT

@inject('QuestionsStore')
@observer
class ResultModal extends Component {

    replayButtonClick = () => {
        const {QuestionsStore} = this.props;
        QuestionsStore.resetState();
        QuestionsStore.resultDisplay();
    }

    render() {
        const {QuestionsStore} = this.props;
        const {score} = QuestionsStore.ansTracker;
        return (
            <Modal display={QuestionsStore.resultDisp} buttonName={'RESET'} clickAction={this.replayButtonClick} modalType={'RESULT'}>
                <span className={'modal_comment'}>{MESSAGE[score]}</span>
                <span className={'modal_score'}>You got {score}/3 right</span>
            </Modal>
        )
    }
}

//// -----HEADER BLOCK----------
//HEADER COMPOENT
@inject('QuestionsStore')
@observer
class Header extends Component {

    howPlayClick = () => {
        const {QuestionsStore} = this.props;
        QuestionsStore.howPlayDisplay('block');
    }

    render() {
        return (
            <div>
                <nav className={'navbar'}>
                    <span className={'brand'}>BUZZZ</span>
                    <span onClick={this.howPlayClick} className={'howPlay'}>How to Play?</span>
                </nav>
            </div>
        );
    }
}

////-------QUESTIONS-BLOCK----------
//IMAGE COMPONENT

@inject('QuestionsStore')
@observer
class Image extends Component {

    onClickImage = (e) => {
        const image = e.target.firstChild.value;
        const questionNum = this.props.qnum;
        this.props.QuestionsStore.setChosenAns(questionNum, image);
        this.props.QuestionsStore.setAnsTracker(questionNum, image);
        this.props.QuestionsStore.resultDisplay();
    }

    render() {
        return (
            <div onClick={(e) => { this.onClickImage(e) }} className={'image'} style={{'backgroundImage': `url(${require('./Images_folder/'+this.props.image+'.png')})`, 'filter': `grayscale(${this.props.grayScale}%)`}}>
                <input type='hidden' value={this.props.image}></input>
            </div>
        );
    }
}

//IMAGEOPTIONS COMPONENT

@inject('QuestionsStore')
@observer
class ImageOptions extends Component {
    render() {
        const {QuestionsStore, qnum} = this.props;
        const chosenAns = QuestionsStore.answerKey[qnum].chosenAns;
        const images = this.props.options.map(function(option, index) {
            return <Image key={`image${index}${qnum}`} image={option.image} grayScale={chosenAns===option.image?0:100} qnum={qnum}/>
        });
        return (
            <div className={'image_block'}>
                {images}
            </div>
        );
    }
}

// QUESTION COMPONENT (SINGULAR)

function Question(props) {

    return (
        <div className={'question_block'}>
            <h1>{props.qnum+1}. {props.question}</h1>
            <ImageOptions options={props.options} qnum={props.qnum}/>
        </div>
    );
}

// QUESTIONS COMPONENT (PLURAL)

function Questions() {
    const questions = QUESTIONS.map(function(item, index) {
        return (<div key={`question${index}`}>
            <Question question={item.question} options={item.options} qnum={index} answer={item.answer}/>
        </div>)
    });
    return (
        <div>
            {questions}
        </div>
    );
}

// APP COMPONENT
function App() {
    return (
      <div className={'App'}>
        <Header />
        <Questions />
        <ResultModal />
        <HowPlayModal />
      </div>
    );
  }

  ReactDOM.render(Root, document.getElementById('root'));
  serviceWorker.unregister();
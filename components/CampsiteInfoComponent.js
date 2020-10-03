import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, Button, StyleSheet, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Input, Rating } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';


const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId)),
    postComment: (campsiteId, rating, author, text) => (postComment(campsiteId, rating, author, text))
};

function RenderCampsite(props) {

    const recognizeComment = ({ dx }) => (dx > 200) ? true : false;
    const { campsite } = props;

    const view = React.createRef();

    const recognizeDrag = ({ dx }) => (dx < -200) ? true : false;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
                .then(endState => console.log(endState.finished ? 'finished' : 'canceled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log('pan responder end', gestureState);
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + campsite.name + ' to favorites?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => console.log('Cancel Pressed')
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()
                        }
                    ],
                    { cancelable: false }
                );
            }
            else if (recognizeComment(gestureState)) {
                props.onShowModal();
            }
            return true;
        }
    });

    const shareCampsite = (title, message, url) => {
        Share.share({
          title,
          message: `${title}: ${message} ${url}`,
          url
        }, {
          dialogTitle: 'Share ' + title
        });
      };    
    
    if (campsite) {
        return (
            <Animatable.View
                animation='fadeInDown'
                duration={2000}
                delay={1000}
                ref={view}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={campsite.name}
                    image={{ uri: baseUrl + campsite.image }}>
                    <Text style={{ margin: 10 }}>
                        {campsite.description}
                    </Text>
                    <View style={styles.cardRow}>
                        <Icon
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            raised
                            reverse
                            onPress={() => props.favorite ? console.log('Already set as a fasvorite') : props.markFavorite()}
                        />
                        <Icon
                            style={styles.cardItem}
                            name={'pencil'}
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.onShowModal()}
                        />
                        <Icon
                            name={'share'}
                            type='font-awesome'
                            color='#5637DD'
                            style={styles.cardItem}
                            raised
                            reverse
                            onPress={() => shareCampsite(campsite.name, campsite.description, baseUrl + campsite.image)}
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    return <View />;
}

function RenderComments({ comments }) {

    const renderCommentItem = ({ item }) => {
        return (
            <View style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.text}</Text>
                <Rating
                    startingValue={+item.rating}
                    readonly
                    imageSize={10}
                    style={{ alignItems: 'flex-start', paddingVertical: '5%' }}
                    fractions={0}
                />
                <Text style={{ fontSize: 12 }}>{`-- ${item.author}, ${item.date}`}</Text>
            </View>
        );
    };
    return (
        <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
            <Card title='Comments'>
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

class CampsiteInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            rating: 5,
            author: '',
            text: ''
        }
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    //what am I doing here??? - yep, think I got it... task 2
    handleComment(campsiteId) {
        this.props.postComment(campsiteId, this.state.rating, this.state.author, this.state.text)
        this.toggleModal();
    }

    resetForm() {
        this.setState({
            rating: 5,
            author: '',
            text: ''
        });
    }
    //what am I doing here??? - yep, think I got it... task 2

    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }

    static navigationOptions = {
        title: 'Campsite Information'
    }

    render() {
        const campsiteId = this.props.navigation.getParam('campsiteId');
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
        return (
            <ScrollView>
                <RenderCampsite campsite={campsite}
                    favorite={this.props.favorites.includes(campsiteId)}
                    markFavorite={() => this.markFavorite(campsiteId)}
                    //is this the right place to put this onShowModal prop? task 1//
                    onShowModal={() => this.toggleModal()}
                />
                <RenderComments comments={comments} />
                <Modal //rating and text modal task 1//
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modalStyle} /* oy vey - more shiznit for task 2 */>
                        <View>
                            <Rating //holy crap it works!!
                                imageSize={40} //check
                                type='star' //check
                                startingValue={this.state.rating} //check
                                style={{ paddingVertical: 10 }} //check
                                onFinishRating={(rating) => this.setState({ rating: rating })} //check
                                // don't need fractions={0}
                                ratingCount={5} //check
                                showRating //check
                            />
                            <Input
                                placeholder='Author'
                                /* ok, so Input and TextInput are like FlatList and ListItem? need to use inputComponent prop of Input to accept TextInput?FlatList = Input | ListItem = TextInput???  inputComponent={TextInput} instead of renderItem --> NO!!! as usual, over complicating... */
                                leftIcon={
                                    <Icon
                                        name='user-o'
                                        type='font-awesome'
                                        value={this.state.author}
                                        containerStyle={{ paddingRight: 10 }}
                                        size={24}
                                        color='black'
                                    />
                                }
                                onChangeText={author => { this.setState({ author: author }) }}
                            />
                            <Input
                                placeholder='Comment'
                                leftIcon={
                                    <Icon
                                        name='comment-o'
                                        type='font-awesome'
                                        value={this.state.comments}
                                        containerStyle={{ paddingRight: 10 }}
                                        size={24}
                                        color='black'
                                    />
                                }
                                onChangeText={text => { this.setState({ text: text }) }}
                            />
                            <Button
                                color='#5637DD'
                                title='Submit'
                                onPress={() => {
                                    this.handleComment(campsiteId); //campsiteId argument in the right place??
                                    this.resetForm();
                                }}
                            />
                            <View /* is this right place for this "inline style task 1" */ style={{ margin: 10 }}>
                                <Button
                                    onPress={() => {
                                        this.toggleModal();
                                        this.resetForm();
                                    }}
                                    color='#808080'
                                    title='Cancel'
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    cardRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    cardItem: {
        flex: 1,
        margin: 10
    },
    modalStyle: {
        justifyContent: 'center',
        margin: 20
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);

/*
deleted from copied over reservation modal - still need? task 1
<Text style={styles.modalTitle}>Search Campsite Reservations</Text>
<Text style={styles.modalText}>Number of Campers: {this.state.campers}</Text>
<Text style={styles.modalText}>Hike-In?: {this.state.hikeIn ? 'Yes' : 'No'}</Text>
<Text style={styles.modalText}>Date: {this.state.date}</Text>
*/